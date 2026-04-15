"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserId } from "./get-current-user-id";

type GetArticlesResult = Awaited<
  ReturnType<(typeof prisma.article)["findMany"]>
>;

type ArticleFilter = "all" | "home" | "favorites" | "archived";

export async function getArticles(
  filter: ArticleFilter = "all",
  searchQuery = ""
): Promise<GetArticlesResult> {
  const userId = await getCurrentUserId();
  const normalizedQuery = searchQuery.trim();

  try {
    const articles = await prisma.article.findMany({
      where: {
        userId,
        ...(filter === "home" ? { isArchived: false } : {}),
        ...(filter === "favorites" ? { isLiked: true } : {}),
        ...(filter === "archived" ? { isArchived: true } : {}),
        ...(normalizedQuery
          ? {
              OR: [
                { title: { contains: normalizedQuery, mode: "insensitive" } },
                { siteName: { contains: normalizedQuery, mode: "insensitive" } },
                { description: { contains: normalizedQuery, mode: "insensitive" } },
              ],
            }
          : {}),
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
