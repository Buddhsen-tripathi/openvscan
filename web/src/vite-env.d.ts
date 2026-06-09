/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*?url" {
  const url: string;
  export default url;
}

declare module "cloudflare:workers" {
  export const env: Record<string, string | undefined>;
}
