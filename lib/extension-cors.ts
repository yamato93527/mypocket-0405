import type { NextRequest } from "next/server";

const allowedOriginPatterns = [
  /^chrome-extension:\/\/[a-z]{32}$/i,
  /^http:\/\/localhost:\d+$/i,
  /^http:\/\/127\.0\.0\.1:\d+$/i,
  /^https:\/\/localhost:\d+$/i,
  /^https:\/\/127\.0\.0\.1:\d+$/i,
] as const;

export function getExtensionCorsHeaders(
  request: NextRequest,
  methods: string
): HeadersInit {
  const origin = request.headers.get("origin");
  const allowedOrigin = origin
    ? allowedOriginPatterns.some((pattern) => pattern.test(origin))
      ? origin
      : null
    : null;

  return {
    ...(allowedOrigin
      ? {
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Origin": allowedOrigin,
          Vary: "Origin",
        }
      : {
          "Access-Control-Allow-Origin": "*",
        }),
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-Token",
    "Access-Control-Allow-Methods": methods,
  };
}
