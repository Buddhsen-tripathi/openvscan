import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <section className="p-3 min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

      {/* Animated SVG Rings */}
      <div
        className="absolute inset-0 flex items-center justify-center blur-3xl pointer-events-none"
        style={{ opacity: 0.15 }}
      >
        <div className="w-[500px] h-[500px] bg-primary/20 rounded-full animate-pulse-slow" />
      </div>

      <div className="relative bg-background/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-full sm:max-w-md px-6 py-8 sm:px-8 mx-auto text-center z-10 animate-fade-in-up">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg shadow-lg shadow-primary/20"
          />
          <h2 className="text-2xl font-bold text-foreground tracking-tight">OpenVScan</h2>
        </div>

        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h3 className="mb-2 text-xl font-semibold text-foreground">Page Not Found</h3>
        <p className="mb-8 text-sm text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-block w-full py-3 font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 cursor-pointer transition-all duration-300"
        >
          Go Home
        </Link>
      </div>
    </section>
  );
}
