import { env } from "cloudflare:workers";
import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "@openvscan/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { drizzle } from "drizzle-orm/d1";
import { getEnv } from "@/src/lib/env";

function createAuth() {
  const appUrl =
    getEnv("BETTER_AUTH_URL") ??
    getEnv("VITE_APP_URL") ??
    "http://localhost:3000";

  const db = drizzle(env.DB, {
    schema: {
      user,
      session,
      account,
      verification,
      userRelations,
      sessionRelations,
      accountRelations,
    },
  });

  // GitHub social login is enabled only when OAuth credentials are configured.
  const githubClientId = getEnv("GITHUB_CLIENT_ID");
  const githubClientSecret = getEnv("GITHUB_CLIENT_SECRET");
  const socialProviders =
    githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          },
        }
      : undefined;

  return betterAuth({
    baseURL: appUrl,
    secret: getEnv("BETTER_AUTH_SECRET"),
    trustedOrigins: [appUrl],
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ url }) {
        console.log("Reset password url:", url);
      },
    },
    socialProviders,
    plugins: [tanstackStartCookies()],
  });
}

// Lazily constructed so the D1 binding (env.DB) is resolved at request time,
// not at module-evaluation time (when Worker bindings are not yet populated).
let cached: ReturnType<typeof createAuth> | null = null;

export function getAuth() {
  cached ??= createAuth();
  return cached;
}
