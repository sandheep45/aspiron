import Credentials from "@auth/core/providers/credentials";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getSession, type StartAuthJSConfig } from "start-authjs";

export const authConfig: StartAuthJSConfig = {
  basePath: "/api/auth",
  secret: process.env.AUTH_SECRET,
  providers: [Credentials({})],
};

export const fetchSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest();
    const session = await getSession(request, authConfig);
    return session;
  },
);
