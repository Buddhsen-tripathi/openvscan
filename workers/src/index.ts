import { Worker, Job } from 'bullmq';
import * as dotenv from 'dotenv';
import { ScanProcessor } from './processors/scan.processor';

// Load environment variables
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

console.log('🚀 Starting OpenVScan Worker Service...');
console.log(`🔌 Connecting to Redis at ${REDIS_URL}`);

const processor = new ScanProcessor();

const worker = new Worker('scan-queue', async (job: Job) => {
  return processor.process(job);
}, {
  connection: {
    url: REDIS_URL
  }
});

worker.on('completed', job => {
  console.log(`[${job.id}] Job completed successfully`);
});

worker.on('failed', (job, err) => {
  console.log(`[${job?.id}] Job failed: ${err.message}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing worker...');
  await worker.close();
});
