import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";

const siteTitle = "OpenVScan - Open Vulnerability Scanner";
const siteDescription =
  "OpenVScan is a web security platform that combines open-source scanners with AI-assisted analysis for faster, more reliable pre-production testing.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: siteTitle },
        { name: "description", content: siteDescription },
        {
          name: "keywords",
          content:
            "OpenVScan, vulnerability scanning, application security, AI security tooling",
        },
        { name: "creator", content: "Buddhsen Tripathi" },
        { property: "og:title", content: siteTitle },
        { property: "og:description", content: siteDescription },
        {
          property: "og:url",
          content: "https://github.com/Buddhsen-tripathi/openvscan",
        },
        { property: "og:site_name", content: "OpenVScan" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: siteTitle },
        { name: "twitter:description", content: siteDescription },
      ],
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..600&family=Lora:ital,wght@0,400..700;1,400..600&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
        },
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/logo.png", type: "image/png" },
      ],
    }),
    component: RootComponent,
  },
);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </RootDocument>
  );
}

// Applied before paint to avoid a flash of the wrong theme. Honors a stored
// preference, falling back to the OS setting.
const themeScript = `(function(){try{var t=localStorage.getItem('openvscan-theme');var dark=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',dark);}catch(e){}})();`;

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: required for the pre-paint theme script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
