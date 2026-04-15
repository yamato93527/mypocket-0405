import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const EXTENSION_SESSION_COOKIE_NAMES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
  "__Secure-authjs.session-token",
  "authjs.session-token",
] as const;

export function getExtensionSessionTokenFromRequest(
  request: NextRequest
): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();
    if (token) {
      return token;
    }
  }

  const headerToken = request.headers.get("x-session-token")?.trim();
  if (headerToken) {
    return headerToken;
  }

  for (const cookieName of EXTENSION_SESSION_COOKIE_NAMES) {
    const cookieValue = request.cookies.get(cookieName)?.value;
    if (cookieValue) {
      return cookieValue;
    }
  }

  return null;
}

export async function getUserIdFromExtensionSessionToken(
  sessionToken: string | null | undefined
): Promise<string | null> {
  const normalizedToken = sessionToken?.trim();

  if (!normalizedToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken: normalizedToken },
    select: {
      expires: true,
      userId: true,
    },
  });

  if (!session || session.expires <= new Date()) {
    return null;
  }

  return session.userId;
}
