import { Job } from 'bullmq';
import { ScanStatus, ScanType } from '@openvscan/types';
import { TrivyScanner } from '../scanners/trivy.scanner';
import { NmapScanner } from '../scanners/nmap.scanner';
import { SemgrepScanner } from '../scanners/semgrep.scanner';
import { ZapScanner } from '../scanners/zap.scanner';
import { Scanner } from '../scanners/base.scanner';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@openvscan/db';
import { eq } from 'drizzle-orm';
import { AiService } from '../ai/ai.service';

export class ScanProcessor {
  private scanners: Map<string, Scanner> = new Map();
  private db;
  private aiService: AiService;

  constructor() {
    // Initialize DB connection
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql, { schema });
    
    // Initialize AI Service
    this.aiService = new AiService();

    // Register available scanners with proper routing
    this.scanners.set(ScanType.DEPENDENCY_AUDIT, new TrivyScanner());
    this.scanners.set(ScanType.CONTAINER, new TrivyScanner());
    this.scanners.set(ScanType.STATIC_ANALYSIS, new SemgrepScanner());
    this.scanners.set(ScanType.DAST, new ZapScanner());
    // Nmap is available as a supplementary network scanner
    this.scanners.set('network', new NmapScanner());
  }

  async process(job: Job) {
    const { scanId, config } = job.data;
    const { target, scanners: requestedScanners } = config;
    
    console.log(`[Scan ${scanId}] Starting processing for target: ${target}`);
    
    try {
      // Update status to RUNNING
      await this.db.update(schema.scan)
        .set({ status: ScanStatus.RUNNING, startedAt: new Date() })
        .where(eq(schema.scan.id, scanId));

      const results = [];

      for (const scanType of requestedScanners) {
        const scanner = this.scanners.get(scanType);
        
        if (!scanner) {
          console.warn(`[Scan ${scanId}] No scanner found for type: ${scanType}`);
          await this.log(scanId, 'warn', `No scanner found for type: ${scanType}`);
          continue;
        }

        if (await scanner.isAvailable()) {
          console.log(`[Scan ${scanId}] Running ${scanner.name} scan...`);
          await this.log(scanId, 'info', `Running ${scanner.name} scan on ${target}`);
          
          const result = await scanner.scan(target, config);
          
          // Enrich findings with AI analysis (critical/high only)
          const enableAi = config.enableAi !== false; // enabled by default
          const enrichedFindings = await Promise.all(result.findings.map(async (f) => {
            const finding = {
              id: crypto.randomUUID(),
              scanId,
              title: f.title,
              description: f.description,
              severity: f.severity,
              location: f.location,
              remediation: f.remediation,
              tool: f.tool,
            };

            // AI-enrich critical/high findings when enabled
            if (enableAi && this.aiService.isEnabled() && this.aiService.shouldAnalyze(f)) {
              try {
                finding.remediation = await this.aiService.analyzeFinding(f);
              } catch (e) {
                console.warn(`[Scan ${scanId}] AI enrichment failed for finding, using default remediation`);
              }
            }
            
            return finding;
          }));

          // Save findings
          if (enrichedFindings.length > 0) {
            await this.db.insert(schema.finding).values(enrichedFindings);
          }
          
          results.push(...result.findings);
          await this.log(scanId, 'info', `${scanner.name} found ${result.findings.length} issue(s)`);
        } else {
          console.warn(`[Scan ${scanId}] Scanner ${scanner.name} is not available in the environment`);
          await this.log(scanId, 'warn', `Scanner ${scanner.name} is not available`);
        }
      }

      // Log AI usage stats if AI was used
      if (this.aiService.isEnabled()) {
        const stats = this.aiService.getUsageStats();
        if (stats.totalCalls > 0) {
          await this.log(scanId, 'info', `AI analysis: ${stats.totalCalls} calls, ${stats.totalInputTokens + stats.totalOutputTokens} tokens used`);
        }
      }

      // Update status to COMPLETED
      await this.db.update(schema.scan)
        .set({ 
          status: ScanStatus.COMPLETED, 
          completedAt: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(schema.scan.id, scanId));

      await this.log(scanId, 'info', `Scan completed with ${results.length} total finding(s)`);

      return {
        status: ScanStatus.COMPLETED,
        resultsCount: results.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[Scan ${scanId}] Failed:`, error);
      
      // Update status to FAILED
      await this.db.update(schema.scan)
        .set({ 
          status: ScanStatus.FAILED, 
          completedAt: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(schema.scan.id, scanId));
      
      await this.log(scanId, 'error', `Scan failed: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  private async log(scanId: string, level: 'info' | 'warn' | 'error', message: string) {
    try {
      await this.db.insert(schema.scanLog).values({
        id: crypto.randomUUID(),
        scanId,
        level,
        message,
        timestamp: new Date()
      });
    } catch (e) {
      console.error('Failed to write scan log', e);
    }
  }
}
