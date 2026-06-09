import { env } from "cloudflare:workers";
import * as schema from "@openvscan/db";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { drizzle } from "drizzle-orm/d1";
import { getAuth } from "@/lib/auth";

/** Drizzle client bound to the D1 binding, with full schema + relations. */
export function getDb() {
  return drizzle(env.DB, { schema });
}

export { schema };

/** Resolve the authenticated user id, or throw (server functions surface this as an error). */
export async function requireUserId(): Promise<string> {
  const session = await getAuth().api.getSession({
    headers: getRequestHeaders(),
  });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}
