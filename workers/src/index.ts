import { Worker, Job } from 'bullmq';
import * as dotenv from 'dotenv';
import { ScanProcessor } from './processors/scan.processor';

// Load environment variables
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const SCAN_TIMEOUT_MS = Number(process.env.SCAN_TIMEOUT_MS) || 10 * 60 * 1000; // 10 minutes default

console.log('🚀 Starting OpenVScan Worker Service...');
console.log(`🔌 Connecting to Redis at ${REDIS_URL}`);
console.log(`⏱️  Scan timeout: ${SCAN_TIMEOUT_MS / 1000}s`);

const processor = new ScanProcessor();

const worker = new Worker('scan-queue', async (job: Job) => {
  // Wrap processor with timeout enforcement
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Scan timed out after ${SCAN_TIMEOUT_MS / 1000}s`)), SCAN_TIMEOUT_MS);
  });

  return Promise.race([
    processor.process(job),
    timeoutPromise,
  ]);
}, {
  connection: {
    url: REDIS_URL,
  },
  concurrency: 3,
});

worker.on('completed', (job) => {
  const duration = job.finishedOn && job.processedOn
    ? `${((job.finishedOn - job.processedOn) / 1000).toFixed(1)}s`
    : 'unknown';
  console.log(`[${job.id}] Job completed in ${duration}`);
});

worker.on('failed', (job, err) => {
  const attempt = job?.attemptsMade ?? 0;
  const maxAttempts = job?.opts?.attempts ?? 1;
  console.error(`[${job?.id}] Job failed (attempt ${attempt}/${maxAttempts}): ${err.message}`);
});

worker.on('error', (err) => {
  console.error('Worker error:', err.message);
});

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n${signal} received. Closing worker gracefully...`);
  await worker.close();
  console.log('Worker closed.');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
