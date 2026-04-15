"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ArticleDataProps = {
  title: string;
  siteName: string;
  description: string;
  siteUpdatedAt: string;
  thumbnail: string;
  url: string;
  content: string;
};

type SaveArticleSuccess = Awaited<
  ReturnType<(typeof prisma.article)["create"]>
>;

export type SaveArticleResult =
  | { success: true; article: SaveArticleSuccess }
  | { success: false; errorMessage: string };

const MAX_TEXT_LENGTH = 100_000;

function sanitizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\u0000/g, "").trim();
}

function normalizeRequiredText(
  value: string | null | undefined,
  fallback = ""
): string {
  const normalized = sanitizeText(value);
  return normalized || fallback;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = sanitizeText(value);
  return normalized || null;
}

function toSaveError(err: unknown): Error {
  if (process.env.NODE_ENV !== "production") {
    console.error("[saveArticle]", err);
  }

  if (typeof err === "object" && err !== null) {
    const name = "name" in err && typeof (err as { name: unknown }).name === "string"
      ? (err as { name: string }).name
      : "";
    if (name === "PrismaClientValidationError") {
      return new Error("保存データの形式が正しくありません。");
    }
    if (
      name === "PrismaClientInitializationError" ||
      name === "PrismaClientRustPanicError"
    ) {
      return new Error(
        "データベースに接続できませんでした。しばらくしてからもう一度お試しください。",
      );
    }

    const code =
      "code" in err && typeof (err as { code: unknown }).code === "string"
        ? (err as { code: string }).code
        : undefined;
    const meta = (err as { meta?: { target?: string[] } }).meta;

    if (code === "P2002") {
      const target = meta?.target ?? [];
      if (target.includes("url")) {
        return new Error("このURLの記事はすでに保存されています。");
      }
      return new Error("同じ内容のデータが既に存在します。");
    }
    if (code === "P2003") {
      return new Error("ユーザー情報が見つかりません。再度ログインしてください。");
    }
  }

  return new Error("記事の保存に失敗しました。しばらくしてからもう一度お試しください。");
}

export async function saveArticle(
  articleData: ArticleDataProps,
  userId: string
): Promise<SaveArticleResult> {
  const url = normalizeRequiredText(articleData.url);
  const normalizedUserId = userId.trim();

  if (!url || !normalizedUserId) {
    throw new Error("URLとユーザー情報が必要です。");
  }

  try {
    const existingArticle = await prisma.article.findUnique({
      where: {
        userId_url: {
          url,
          userId: normalizedUserId,
        },
      },
      select: { id: true },
    });

    if (existingArticle) {
      console.log("URLが重複しています");
      return {
        errorMessage: "この記事はすでに登録されています",
        success: false,
      };
    }

    const article = await prisma.article.create({
      data: {
        userId: normalizedUserId,
        title: normalizeRequiredText(articleData.title, "タイトルなし"),
        siteName: normalizeRequiredText(
          articleData.siteName,
          new URL(url).hostname
        ),
        description: normalizeOptionalText(articleData.description),
        siteUpdatedAt: normalizeRequiredText(
          articleData.siteUpdatedAt,
          new Date().toISOString()
        ),
        thumbnail: normalizeOptionalText(articleData.thumbnail),
        url,
        content:
          normalizeOptionalText(articleData.content)?.slice(0, MAX_TEXT_LENGTH) ??
          null,
      },
    });

    revalidatePath("/");

    return { success: true, article };
  } catch (err) {
    throw toSaveError(err);
  }
}
