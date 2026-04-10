import MobileLayout from "./components/MobileLayout";
import ArticleLists from "./components/ArticleLists";

type HomeProps = {
  searchParams?: {
    filter?: string;
  };
};

export default async function Home({ searchParams }: HomeProps) {
  const filterParam = searchParams?.filter;
  const filter =
    filterParam === "favorites"
      ? "favorites"
      : filterParam === "archived"
      ? "archived"
      : "all";

  return (
    <MobileLayout>
      <ArticleLists filter={filter} />
    </MobileLayout>
  );
}
