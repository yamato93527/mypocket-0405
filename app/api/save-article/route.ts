import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { extractUrlData } from "@/app/actions/articles/extract-url-data";
import { saveArticle } from "@/app/actions/articles/save-article";
import { authOptions } from "@/auth";

type SaveArticleBody = {
  url?: string;
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "不明なエラーが発生しました";
}

const ALLOWED_ORIGIN_PATTERNS = [
  /^chrome-extension:\/\/.+$/,
  /^http:\/\/localhost:3000$/,
  /^http:\/\/127\.0\.0\.1:3000$/,
  /^http:\/\/localhost:3001$/,
  /^http:\/\/127\.0\.0\.1:3001$/,
];

function getCorsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin");
  const isAllowedOrigin = origin
    ? ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
    : false;

  return {
    ...(isAllowedOrigin
      ? {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        }
      : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function jsonWithCors(
  request: NextRequest,
  body: Record<string, unknown>,
  init?: ResponseInit
) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...getCorsHeaders(request),
      ...(init?.headers ?? {}),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveArticleBody;
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id?.trim() ?? "";

    if (!url) {
      return jsonWithCors(
        request,
        { success: false, error: "URLが必要です。" },
        { status: 400 },
      );
    }

    if (!userId) {
      return jsonWithCors(
        request,
        {
          success: false,
          error: "ログインが必要です。my-pocket にサインインしてください。",
        },
        { status: 401 },
      );
    }

    // サイトデータの取得
    const formData = new FormData();
    formData.append("url", url);
    const articleData = await extractUrlData(formData);

    if (!articleData) {
      return jsonWithCors(
        request,
        { success: false, error: "サイトデータの取得に失敗しました" },
        { status: 400 },
      );
    }

    // データの保存
    const result = await saveArticle(articleData, userId);

    if (!result.success) {
      return jsonWithCors(
        request,
        { success: false, error: result.errorMessage },
        { status: 400 },
      );
    }

    return jsonWithCors(request, {
      success: true,
      message: "データを受け取りました",
    });
  } catch (err) {
    console.error(err);
    return jsonWithCors(
      request,
      {
        success: false,
        error: errorMessage(err),
      },
      { status: 500 },
    );
  }
}

// CORS設定
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}
