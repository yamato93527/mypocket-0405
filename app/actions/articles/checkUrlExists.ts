"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserId } from "./get-current-user-id";

export async function checkUrlExists(url: string) {
  const userId = await getCurrentUserId();

  const normalizedUrl = url.trim();

  const isExistsArticle = await prisma.article.findUnique({
    where: {
      userId_url: {
        userId,
        url: normalizedUrl,
      },
    },
  });

  return !!isExistsArticle;
}
