import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    return auth.api.getSession({
      headers: getRequestHeaders(),
    });
  },
);

export const requireSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    });

    if (!session) {
      throw redirect({ to: "/signin" });
    }

    return {
      user: {
        name: session.user.name,
        email: session.user.email,
      },
    };
  },
);
