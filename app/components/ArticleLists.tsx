import { getArticles } from "../actions/articles/get-articles";
import ArticleCard from "./ArticleCard";

type ArticleListsProps = {
  filter: "all" | "home" | "favorites" | "archived";
  searchQuery?: string;
};

const FILTER_TITLES: Record<ArticleListsProps["filter"], string> = {
  all: "すべて",
  home: "ホーム",
  favorites: "お気に入り",
  archived: "アーカイブ",
};

async function ArticleLists({ filter, searchQuery = "" }: ArticleListsProps) {
  const articlesData = await getArticles(filter, searchQuery);
  const normalizedQuery = searchQuery.trim();
  const pageTitle = normalizedQuery
    ? `検索結果：${normalizedQuery}`
    : FILTER_TITLES[filter];

  if (!articlesData.length) {
    return (
      <div className="w-full lg:w-4/5 px-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-5xl font-bold leading-none">{pageTitle}</h2>
        </div>
        <hr />
        <div className="w-full text-center py-8">
          {normalizedQuery
            ? "検索条件に一致する記事がありません"
            : "記事がまだ登録されていません"}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-4/5 px-4">
      {/* タイトル */}
      <div className="flex justify-between mb-4">
        <h2 className="text-5xl font-bold leading-none">{pageTitle}</h2>
      </div>

      <hr />

      <div className="py-4 flex flex-col gap-3">
        {articlesData.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

export default ArticleLists;
