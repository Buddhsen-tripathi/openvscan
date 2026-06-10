import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';
import { scan } from './scan';

// Enum value sets matching @openvscan/types.
export const SCAN_MODES = ['automatic', 'manual'] as const;

/**
 * A GitHub App installation, associated with the OpenVScan user who connected
 * it. We mint installation access tokens from this to call the GitHub API.
 */
export const githubInstallation = sqliteTable('github_installation', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // GitHub's numeric installation id (stored as text to avoid precision issues).
  installationId: text('installation_id').notNull().unique(),
  accountLogin: text('account_login').notNull(),
  accountType: text('account_type').notNull(), // 'User' | 'Organization'
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * A connected GitHub repository plus its scan-trigger configuration.
 */
export const repository = sqliteTable('repository', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  installationId: text('installation_id')
    .notNull()
    .references(() => githubInstallation.id, { onDelete: 'cascade' }),
  githubRepoId: text('github_repo_id').notNull(),
  owner: text('owner').notNull(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  defaultBranch: text('default_branch').notNull().default('main'),
  private: integer('private', { mode: 'boolean' }).default(false).notNull(),
  scanMode: text('scan_mode', { enum: SCAN_MODES }).default('manual').notNull(),
  // Comma-separated branch allowlist; null = all branches.
  branchFilter: text('branch_filter'),
  enabledScanners: text('enabled_scanners', { mode: 'json' })
    .$type<string[]>()
    .default([])
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const githubInstallationRelations = relations(
  githubInstallation,
  ({ one, many }) => ({
    user: one(user, {
      fields: [githubInstallation.userId],
      references: [user.id],
    }),
    repositories: many(repository),
  }),
);

export const repositoryRelations = relations(repository, ({ one, many }) => ({
  user: one(user, {
    fields: [repository.userId],
    references: [user.id],
  }),
  installation: one(githubInstallation, {
    fields: [repository.installationId],
    references: [githubInstallation.id],
  }),
  scans: many(scan),
}));
