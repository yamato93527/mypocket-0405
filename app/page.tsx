import MobileLayout from "./components/MobileLayout";
import ArticleLists from "./components/ArticleLists";

type HomeProps = {
  searchParams?: Promise<{
    filter?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const rawFilterParam = resolvedSearchParams?.filter;
  const filterParam = Array.isArray(rawFilterParam)
    ? rawFilterParam[0]
    : rawFilterParam;
  const filter =
    filterParam === "favorites"
      ? "favorites"
      : filterParam === "archived"
      ? "archived"
      : filterParam === "home"
      ? "home"
      : "all";

  return (
    <MobileLayout>
      <ArticleLists filter={filter} />
    </MobileLayout>
  );
}
