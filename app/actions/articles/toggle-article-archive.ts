"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "./get-current-user-id";

type ToggleArticleArchiveResult =
  | { success: true }
  | { success: false; errorMessage: string };

export async function toggleArticleArchive(
  articleId: string,
  isArchived: boolean
): Promise<ToggleArticleArchiveResult> {
  const userId = await getCurrentUserId();

  try {
    const updated = await prisma.article.updateMany({
      where: {
        id: articleId,
        userId,
      },
      data: {
        isArchived,
      },
    });

    if (updated.count === 0) {
      return {
        success: false,
        errorMessage: "対象の記事が見つかりませんでした。",
      };
    }

    revalidatePath("/");

    return { success: true };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[toggleArticleArchive]", err);
    }

    return {
      success: false,
      errorMessage: "アーカイブ状態の更新に失敗しました。",
    };
  }
}
