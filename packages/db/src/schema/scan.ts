import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

// Enum value sets matching @openvscan/types (SQLite has no native enum type;
// these are enforced as CHECK constraints via drizzle's `enum` option).
export const SCAN_STATUSES = [
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
] as const;

export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const;

type ScanConfig = {
  target: string;
  scanners: string[];
  enableAi?: boolean;
};

export const project = sqliteTable('project', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const scan = sqliteTable('scan', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  status: text('status', { enum: SCAN_STATUSES }).default('pending').notNull(),
  config: text('config', { mode: 'json' }).$type<ScanConfig>().notNull(),
  // Set when the consumer should stop a running scan (cancel-via-flag).
  cancelRequested: integer('cancel_requested', { mode: 'boolean' })
    .default(false)
    .notNull(),
  // R2 object key for the raw scanner output artifact.
  artifactKey: text('artifact_key'),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const finding = sqliteTable('finding', {
  id: text('id').primaryKey(),
  scanId: text('scan_id')
    .notNull()
    .references(() => scan.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity', { enum: SEVERITIES }).notNull(),
  location: text('location'),
  remediation: text('remediation'),
  tool: text('tool').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const scanLog = sqliteTable('scan_log', {
  id: text('id').primaryKey(),
  scanId: text('scan_id')
    .notNull()
    .references(() => scan.id, { onDelete: 'cascade' }),
  level: text('level').notNull(), // 'info' | 'warn' | 'error'
  message: text('message').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Relations (dialect-agnostic)
export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
  scans: many(scan),
}));

export const scanRelations = relations(scan, ({ one, many }) => ({
  project: one(project, {
    fields: [scan.projectId],
    references: [project.id],
  }),
  findings: many(finding),
  logs: many(scanLog),
}));

export const findingRelations = relations(finding, ({ one }) => ({
  scan: one(scan, {
    fields: [finding.scanId],
    references: [scan.id],
  }),
}));

export const scanLogRelations = relations(scanLog, ({ one }) => ({
  scan: one(scan, {
    fields: [scanLog.scanId],
    references: [scan.id],
  }),
}));
