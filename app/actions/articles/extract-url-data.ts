"use server";

import {
  fetchArticleFromUrl,
  type FetchedArticleData,
} from "@/lib/fetch-article-from-url";

export async function extractUrlData(
  formData: FormData
): Promise<FetchedArticleData | null> {
  const raw = formData.get("url");
  const url = typeof raw === "string" ? raw.trim() : "";
  if (!url) {
    return null;
  }
  try {
    new URL(url);
  } catch {
    return null;
  }

  return fetchArticleFromUrl(url);
}
