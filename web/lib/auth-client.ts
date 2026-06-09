import { createAuthClient } from "better-auth/react";

// In the browser, default to the current origin so the deployed app talks to
// itself without a build-time URL. Falls back to the configured/local value.
const baseURL =
  import.meta.env.VITE_APP_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

export const authClient = createAuthClient({ baseURL });

export const { signIn, signUp, useSession, signOut, resetPassword } =
  authClient;
