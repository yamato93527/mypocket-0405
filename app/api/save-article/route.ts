
import { extractUrlData } from "@/app/actions/articles/extract-url-data";
import { saveArticle } from "@/app/actions/articles/save-article";
import { authOptions } from "@/auth";
import { getExtensionCorsHeaders } from "@/lib/extension-cors";
import {
  getExtensionSessionTokenFromRequest,
  getUserIdFromExtensionSessionToken,
} from "@/lib/extension-session";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

function json(request: NextRequest, data: unknown, status = 200) {
  return NextResponse.json(data, {
    headers: getExtensionCorsHeaders(request, "POST, OPTIONS"),
    status,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionToken?: string;
      url?: string;
    };

    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) {
      return json(request, { success: false, error: "URLが指定されていません" }, 400);
    }

    const session = await getServerSession(authOptions);
    const fallbackSessionToken =
      body.sessionToken ?? getExtensionSessionTokenFromRequest(request);
    const userId =
      session?.user?.id ??
      (await getUserIdFromExtensionSessionToken(fallbackSessionToken));

    if (!userId) {
      return json(
        request,
        { success: false, error: "ユーザーが認証されていません" },
        401
      );
    }

    const formData = new FormData();
    formData.append("url", url);

    const articleData = await extractUrlData(formData);
    if (!articleData) {
      return json(
        request,
        { success: false, error: "サイトデータの取得に失敗しました" },
        400
      );
    }

    const result = await saveArticle(articleData, userId);
    if (!result.success) {
      return json(request, { success: false, error: result.errorMessage }, 400);
    }

    return json(request, {
      success: true,
      message: "データを受け取りました",
    });
  } catch (err) {
    console.error(err);
    return json(
      request,
      {
        success: false,
        error:
          err instanceof Error ? err.message : "不明なエラーが発生しました",
      },
      500
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: getExtensionCorsHeaders(request, "POST, OPTIONS"),
    status: 200,
  });
}
            