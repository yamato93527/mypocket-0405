
import { authOptions } from "@/auth";
import { getExtensionCorsHeaders } from "@/lib/extension-cors";
import {
  getExtensionSessionTokenFromRequest,
  getUserIdFromExtensionSessionToken,
} from "@/lib/extension-session";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

function json(request: NextRequest, data: unknown, status = 200) {
  return NextResponse.json(data, {
    headers: getExtensionCorsHeaders(request, "GET, OPTIONS"),
    status,
  });
}

export async function GET(request: NextRequest) {
  try {
    const serverSession = await getServerSession(authOptions);

    if (serverSession?.user?.id) {
      return json(request, {
        authenticated: true,
        user: {
          email: serverSession.user.email,
          id: serverSession.user.id,
          name: serverSession.user.name,
        },
      });
    }

    const sessionToken = getExtensionSessionTokenFromRequest(request);
    const userId = await getUserIdFromExtensionSessionToken(sessionToken);

    if (!userId) {
      return json(request, { authenticated: false }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        id: true,
        name: true,
      },
    });

    if (!user) {
      return json(request, { authenticated: false }, 401);
    }

    return json(request, {
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("認証状態確認エラー:", error);
    return json(
      request,
      { authenticated: false, error: "認証確認に失敗しました" },
      500
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: getExtensionCorsHeaders(request, "GET, OPTIONS"),
    status: 200,
  });
}
            