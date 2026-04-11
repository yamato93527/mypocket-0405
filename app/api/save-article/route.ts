import { NextRequest, NextResponse } from "next/server";
import { extractUrlData } from "@/app/actions/articles/extract-url-data";
import { saveArticle } from "@/app/actions/articles/save-article";

type SaveArticleBody = {
  url?: string;
  userId?: string;
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "不明なエラーが発生しました";
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonWithCors(
  body: Record<string, unknown>,
  init?: ResponseInit
) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveArticleBody;
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";

    if (!url || !userId) {
      return jsonWithCors(
        { success: false, error: "URLとユーザーIDが必要です。" },
        { status: 400 },
      );
    }

    // サイトデータの取得
    const formData = new FormData();
    formData.append("url", url);
    const articleData = await extractUrlData(formData);

    if (!articleData) {
      return jsonWithCors(
        { success: false, error: "サイトデータの取得に失敗しました" },
        { status: 400 },
      );
    }

    // データの保存
    const result = await saveArticle(articleData, userId);

    if (!result.success) {
      return jsonWithCors(
        { success: false, error: result.errorMessage },
        { status: 400 },
      );
    }

    return jsonWithCors({
      success: true,
      message: "データを受け取りました",
    });
  } catch (err) {
    console.error(err);
    return jsonWithCors(
      {
        success: false,
        error: errorMessage(err),
      },
      { status: 500 },
    );
  }
}

// CORS設定
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
