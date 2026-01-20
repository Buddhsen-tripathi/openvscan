import { pgTable, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './auth';

// Enums matching @openvscan/types
export const scanStatusEnum = pgEnum('scan_status', [
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
]);

export const severityEnum = pgEnum('severity', [
  'critical',
  'high',
  'medium',
  'low',
  'info',
]);

export const project = pgTable('project', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const scan = pgTable('scan', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  status: scanStatusEnum('status').default('pending').notNull(),
  config: jsonb('config').notNull(), // Stores ScanConfig
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const finding = pgTable('finding', {
  id: text('id').primaryKey(),
  scanId: text('scan_id')
    .notNull()
    .references(() => scan.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: severityEnum('severity').notNull(),
  location: text('location'),
  remediation: text('remediation'),
  tool: text('tool').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scanLog = pgTable('scan_log', {
  id: text('id').primaryKey(),
  scanId: text('scan_id')
    .notNull()
    .references(() => scan.id, { onDelete: 'cascade' }),
  level: text('level').notNull(), // 'info', 'warn', 'error'
  message: text('message').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
