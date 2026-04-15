"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "./get-current-user-id";

type ToggleArticleLikeResult =
  | { success: true }
  | { success: false; errorMessage: string };

export async function toggleArticleLike(
  articleId: string,
  isLiked: boolean
): Promise<ToggleArticleLikeResult> {
  const userId = await getCurrentUserId();

  try {
    const updated = await prisma.article.updateMany({
      where: {
        id: articleId,
        userId,
      },
      data: {
        isLiked,
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
      console.error("[toggleArticleLike]", err);
    }

    return {
      success: false,
      errorMessage: "お気に入りの更新に失敗しました。",
    };
  }
}
