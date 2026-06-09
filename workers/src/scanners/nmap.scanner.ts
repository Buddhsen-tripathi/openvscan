import { execa } from 'execa';
import { Scanner, ScanResult } from './base.scanner';
import { Finding, Severity, ScanConfig } from '@openvscan/types';

export class NmapScanner implements Scanner {
  name = 'Nmap';

  async isAvailable(): Promise<boolean> {
    try {
      await execa('nmap', ['--version']);
      return true;
    } catch {
      return false;
    }
  }

  async scan(target: string, config?: ScanConfig): Promise<ScanResult> {
    const isAvailable = await this.isAvailable();
    if (!isAvailable) {
      throw new Error('Nmap is not installed or available in PATH');
    }

    try {
      // Run nmap with XML output for structured parsing
      // -sV: Version detection, -sC: Default scripts, --top-ports 1000
      const args = [
        '-sV',
        '-sC',
        '--top-ports', '1000',
        '-oX', '-', // XML output to stdout
        '--no-stylesheet',
        target,
      ];

      console.log(`[Nmap] Running command: nmap ${args.join(' ')}`);
      const { stdout } = await execa('nmap', args);

      const findings = this.parseFindings(stdout, target);

      return {
        findings,
        rawOutput: stdout,
      };
    } catch (error) {
      console.error('[Nmap] Scan error:', error);
      throw error;
    }
  }

  private parseFindings(xmlOutput: string, target: string): Finding[] {
    const findings: Finding[] = [];

    // Parse open ports from XML output using regex (lightweight, no XML dep)
    const portRegex = /<port protocol="(\w+)" portid="(\d+)">.*?<state state="(\w+)".*?\/>.*?<service name="(\w+)".*?(?:product="([^"]*)")?.*?(?:version="([^"]*)")?.*?\/>/gs;

    let match;
    while ((match = portRegex.exec(xmlOutput)) !== null) {
      const [, protocol, port, state, serviceName, product, version] = match;

      if (state === 'open') {
        const severity = this.assessPortSeverity(Number(port), serviceName);
        const productInfo = [product, version].filter(Boolean).join(' ');

        findings.push({
          id: `nmap-${target}-${port}-${protocol}`,
          scanId: '',
          title: `Open port ${port}/${protocol} (${serviceName})`,
          description: `Port ${port}/${protocol} is open running ${serviceName}${productInfo ? ` (${productInfo})` : ''}. Open ports increase the attack surface and should be reviewed.`,
          severity,
          location: `${target}:${port}/${protocol}`,
          remediation: this.getRemediation(Number(port), serviceName),
          tool: 'nmap',
          createdAt: new Date(),
        });
      }
    }

    // Parse script output for vulnerabilities
    const scriptRegex = /<script id="([^"]*)"[^>]*output="([^"]*)"/g;
    while ((match = scriptRegex.exec(xmlOutput)) !== null) {
      const [, scriptId, output] = match;

      if (output.toLowerCase().includes('vulnerable') || output.toLowerCase().includes('vuln')) {
        findings.push({
          id: `nmap-script-${scriptId}`,
          scanId: '',
          title: `Nmap script detection: ${scriptId}`,
          description: output.substring(0, 1000),
          severity: Severity.HIGH,
          location: target,
          remediation: 'Review the vulnerability details and apply relevant patches or configuration changes.',
          tool: 'nmap',
          createdAt: new Date(),
        });
      }
    }

    return findings;
  }

  private assessPortSeverity(port: number, service: string): Severity {
    // High-risk services
    const criticalServices = ['telnet', 'ftp', 'rlogin', 'rsh', 'vnc'];
    const highRiskPorts = [21, 23, 445, 3389, 5900, 5901];
    const mediumRiskPorts = [22, 25, 110, 143, 3306, 5432, 6379, 27017];

    if (criticalServices.includes(service.toLowerCase())) return Severity.HIGH;
    if (highRiskPorts.includes(port)) return Severity.HIGH;
    if (mediumRiskPorts.includes(port)) return Severity.MEDIUM;
    return Severity.LOW;
  }

  private getRemediation(port: number, service: string): string {
    const remediations: Record<string, string> = {
      telnet: 'Disable Telnet and use SSH instead for encrypted remote access.',
      ftp: 'Disable FTP and use SFTP or SCP for secure file transfers.',
      ssh: 'Ensure SSH is configured with key-based authentication and disable password login.',
      http: 'Consider using HTTPS. Ensure the web server is properly configured and up to date.',
      https: 'Verify TLS configuration and certificate validity.',
      mysql: 'Restrict database access to trusted IPs only. Ensure strong authentication.',
      postgresql: 'Restrict database access to trusted IPs only. Use SSL connections.',
      redis: 'Enable Redis authentication and restrict network access. Never expose to the internet.',
      mongodb: 'Enable authentication and restrict network access.',
    };

    return remediations[service.toLowerCase()]
      || `Review if port ${port} (${service}) needs to be publicly accessible. Restrict access where possible.`;
  }
}
