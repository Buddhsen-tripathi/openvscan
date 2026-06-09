import { env } from "cloudflare:workers";

type WebEnv = {
  DATABASE_URL?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  VITE_APP_URL?: string;
  VITE_API_URL?: string;
};

const workerEnv = env as WebEnv;

export function getEnv(name: keyof WebEnv): string | undefined {
  return workerEnv[name] ?? process.env[name];
}

export function getRequiredEnv(name: keyof WebEnv): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}
