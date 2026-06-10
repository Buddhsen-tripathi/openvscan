import { createFileRoute } from "@tanstack/react-router";
import { requireUserId } from "@/lib/db";
import { syncInstallation } from "@/lib/github";

/**
 * GitHub redirects here after the user installs (or reconfigures) the App.
 * We associate the installation with the signed-in user, then send them to
 * the repositories page to connect repos.
 */
export const Route = createFileRoute("/api/github/setup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const installationId = url.searchParams.get("installation_id");

        let userId: string;
        try {
          userId = await requireUserId();
        } catch {
          // Not signed in — bounce through sign-in and come back here.
          const back = encodeURIComponent(url.pathname + url.search);
          return Response.redirect(
            `${url.origin}/signin?redirect=${back}`,
            302,
          );
        }

        if (!installationId) {
          return Response.redirect(
            `${url.origin}/dashboard/repositories?error=missing_installation`,
            302,
          );
        }

        try {
          await syncInstallation(userId, installationId);
        } catch (e) {
          const message = e instanceof Error ? e.message : "setup_failed";
          return Response.redirect(
            `${url.origin}/dashboard/repositories?error=${encodeURIComponent(message)}`,
            302,
          );
        }

        return Response.redirect(
          `${url.origin}/dashboard/repositories?connected=1`,
          302,
        );
      },
    },
  },
});
