import Image from "next/image";
import Link from "next/link";
import { CiClock2 } from "react-icons/ci";
import { FaRegHeart, FaArchive } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { getArticles } from "../actions/articles/get-articles";

async function ArticleLists() {
  const articlesData = await getArticles();

  if (!articlesData.length) {
    return (
      <div className="w-full text-center">記事がまだ登録されていません</div>
    );
  }

  return (
    <div className="w-full lg:w-4/5 px-4">
      {/* タイトル */}
      <div className="flex justify-between mb-4">
        <h2 className="text-5xl font-bold leading-none">記事一覧</h2>
      </div>

      <hr />

      <div className="py-4 flex flex-col gap-3">
        {articlesData.map((article) => (
          <Link key={article.id} href={article.url} className="block">
            <div className="border border-gray-400 bg-white group hover:bg-gray-50 transition-colors px-3 py-3">
              <div className="flex justify-between gap-4 flex-col-reverse md:flex-row">
                {/* 左側 （タイトル・デスクリプション等）*/}
                <div className="w-full md:w-3/5 lg:w-4/5 flex flex-col min-w-0">
                  {/* タイトル部分 */}
                  <div className="mb-2">
                    <h3 className="font-bold text-2xl leading-tight mb-1 line-clamp-2">
                      {article.title}
                    </h3>
                    {/* サイトタイトル */}
                    <span className="text-gray-400 text-sm">
                      {article.siteName}
                    </span>
                  </div>

                  <div className="mb-3">
                    {/* デスクリプション */}
                    <p className="line-clamp-3 text-gray-700 text-lg leading-relaxed">
                      {article.description}
                    </p>
                  </div>

                  {/* 日時・アイコン */}
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center text-xl">
                      <CiClock2 className="mr-1" />
                      <span className="text-2xl">
                        {new Date(article.siteUpdatedAt).toLocaleDateString("sv-SE")}
                      </span>
                    </div>

                    {/* アイコン */}
                    <div className="relative z-20">
                      <div className="flex gap-4 items-center text-2xl">
                        <FaRegHeart />
                        <FaArchive />
                        <FaRegTrashCan />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右側 （サムネ）*/}
                <div className="w-full md:w-2/5 lg:w-1/5 pointer-events-none aspect-[16/9] md:aspect-[3/2] shrink-0">
                  <div className="relative w-full h-full">
                    {article.thumbnail ? (
                      <Image
                        className="object-cover object-center"
                        src={article.thumbnail}
                        alt="サムネイル画像"
                        fill={true}
                        sizes="300px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm">
                        画像なし
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ArticleLists;
