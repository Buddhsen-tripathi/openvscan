import {
  appOctokit,
  getInstallationAccount,
  type InstallationRepo,
  installationOctokit,
  listInstallationRepos,
} from "@openvscan/github";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getEnv } from "@/src/lib/env";

/**
 * Server-side GitHub App glue shared by the webhook/setup routes and the
 * dashboard server functions. Wraps the provider-agnostic helpers in
 * `@openvscan/github` with OpenVScan's env + D1 persistence.
 */

export function isGithubConfigured(): boolean {
  return Boolean(getEnv("GITHUB_APP_ID") && getEnv("GITHUB_APP_PRIVATE_KEY"));
}

export function getAppCreds() {
  const appId = getEnv("GITHUB_APP_ID");
  const rawKey = getEnv("GITHUB_APP_PRIVATE_KEY");
  if (!appId || !rawKey) {
    throw new Error("GitHub App is not configured");
  }
  // Secrets set via `wrangler secret put` keep real newlines; .dev.vars often
  // stores the PEM with escaped "\n" — normalise both to a valid key.
  return { appId, privateKey: rawKey.replace(/\\n/g, "\n") };
}

/** Public install URL for the GitHub App (or null when the slug is unset). */
export function installUrl(): string | null {
  const slug = getEnv("GITHUB_APP_SLUG");
  return slug ? `https://github.com/apps/${slug}/installations/new` : null;
}

/**
 * Upsert the installation row for `installationId`, associating it with the
 * user who just completed the App install. Returns the stored row.
 */
export async function syncInstallation(userId: string, installationId: string) {
  const creds = getAppCreds();
  const account = await getInstallationAccount(
    appOctokit(creds),
    installationId,
  );
  const db = getDb();

  const existing = await db.query.githubInstallation.findFirst({
    where: eq(schema.githubInstallation.installationId, installationId),
  });

  if (existing) {
    await db
      .update(schema.githubInstallation)
      .set({
        userId,
        accountLogin: account.login,
        accountType: account.type,
      })
      .where(eq(schema.githubInstallation.id, existing.id));
    return { ...existing, userId, ...account };
  }

  const id = crypto.randomUUID();
  await db.insert(schema.githubInstallation).values({
    id,
    userId,
    installationId,
    accountLogin: account.login,
    accountType: account.type,
  });
  const row = await db.query.githubInstallation.findFirst({
    where: eq(schema.githubInstallation.id, id),
  });
  return row!;
}

/** Octokit scoped to a stored installation row. */
export function octokitForInstallation(installationId: string) {
  return installationOctokit({ ...getAppCreds(), installationId });
}

/** List every repo the installation can access (live from GitHub). */
export function accessibleRepos(
  installationId: string,
): Promise<InstallationRepo[]> {
  return listInstallationRepos(octokitForInstallation(installationId));
}
