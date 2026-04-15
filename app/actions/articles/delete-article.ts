"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "./get-current-user-id";

type DeleteArticleResult =
  | { success: true }
  | { success: false; errorMessage: string };

export async function deleteArticle(
  articleId: string
): Promise<DeleteArticleResult> {
  const userId = await getCurrentUserId();

  try {
    const deleted = await prisma.article.deleteMany({
      where: {
        id: articleId,
        userId,
      },
    });

    if (deleted.count === 0) {
      return {
        success: false,
        errorMessage: "削除対象の記事が見つかりませんでした。",
      };
    }

    revalidatePath("/");

    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[deleteArticle]", err);
    }

    return {
      success: false,
      errorMessage: "記事の削除に失敗しました。",
    };
  }
}
