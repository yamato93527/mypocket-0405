"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserId } from "./get-current-user-id";

type GetArticlesResult = Awaited<
  ReturnType<(typeof prisma.article)["findMany"]>
>;

export async function getArticles(): Promise<GetArticlesResult> {
  try {
    const userId = getCurrentUserId();

    const articles = await prisma.article.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return articles;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[getArticles]", err);
    }
    return [];
  }
}
