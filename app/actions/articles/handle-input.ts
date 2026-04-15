"use server";

import type { ArticleInputState } from "./article-input-state";
import { extractUrlData } from "./extract-url-data";
import { getCurrentUserId } from "./get-current-user-id";
import { saveArticle } from "./save-article";

export async function handleArticleInput(
  _prevState: ArticleInputState,
  formData: FormData
): Promise<ArticleInputState> {
  const raw = formData.get("url");
  const urlField = typeof raw === "string" ? raw.trim() : "";
  if (!urlField) {
    return { error: "URLを入力してください。", success: null };
  }

  const articleData = (await extractUrlData(formData)) as unknown;
  if (!articleData || typeof articleData !== "object") {
    return {
      error: "URLの形式が正しくないか、記事を取得できませんでした。",
      success: null,
    };
  }

  const userId = await getCurrentUserId();

  try {
    const result = await saveArticle(
      articleData as Parameters<typeof saveArticle>[0],
      userId
    );
    if (!result.success) {
      return {
        error: result.errorMessage,
        success: null,
      };
    }
    return {
      error: null,
      success: "記事を保存しました。",
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "保存に失敗しました。もう一度お試しください。";
    return {
      error: message,
      success: null,
    };
  }
}
