import { neon } from "@neondatabase/serverless";
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
import { drizzle } from "drizzle-orm/neon-http";
import { getEnv, getRequiredEnv } from "@/src/lib/env";

const appUrl =
  getEnv("BETTER_AUTH_URL") ??
  getEnv("VITE_APP_URL") ??
  "http://localhost:3000";
const databaseUrl = getRequiredEnv("DATABASE_URL");

const db = drizzle(neon(databaseUrl), {
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

export const auth = betterAuth({
  baseURL: appUrl,
  secret: getEnv("BETTER_AUTH_SECRET"),
  trustedOrigins: [appUrl],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(url, user) {
      console.log("Reset password url:", url);
    },
  },
  plugins: [tanstackStartCookies()],
});
