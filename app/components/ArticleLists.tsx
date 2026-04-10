import Image from "next/image";
import { CiClock2 } from "react-icons/ci";
import { FaRegHeart, FaArchive } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
// import { articleData } from "@/constants/articleData";
import { fetchArticleFromUrl } from "@/lib/fetch-article-from-url";

async function ArticleLists() {
  const articleData = await fetchArticleFromUrl(
    "https://yu-and-you.com/sigma1424mm/"
  );

  if (!articleData) {
    return (
      <div className="w-full text-center">データを取得できませんでした</div>
    );
  }

  return (
    <div className="w-full lg:w-4/5 px-4">
      {/* タイトル */}
      <div className="flex justify-between mb-4">
        <h2 className="text-4xl font-bold">記事一覧</h2>
      </div>

      <hr />

      <div className="p-4 flex flex-col gap-4">
        {/* 記事データここから */}
        <div className="border group hover:bg-gray-50 transition-colors px-4 pt-4 pb-3 relative">
          <div className="flex justify-between flex-col-reverse md:flex-row gap-8">
            {/* 左側 （タイトル・デスクリプション等）*/}
            <div className="w-full md:w-3/5 lg:w-3/4 flex flex-col">
              {/* タイトル部分 */}
              <div className="mb-4">
                <h3 className="font-bold text-lg md:text-xl mb-1">
                  {articleData.title}
                </h3>
                {/* サイトタイトル */}
                <span className="text-gray-400 text-xs md:text-sm">
                  {articleData.siteName}
                </span>
              </div>

              <div className="mb-4">
                {/* デスクリプション */}
                <p className="line-clamp-3 text-gray-700 text-base">
                  {articleData.description}
                </p>
              </div>
            </div>

            {/* 右側 （サムネ）*/}
            <div className="w-full md:w-2/5 lg:w-1/4 pointer-events-none aspect-[16/9] md:aspect-[3/2]">
              <div className="relative w-full h-full">
                <Image
                  className="object-cover md:object-contain object-center md:object-top"
                  src={articleData.thumbnail}
                  alt="サムネイル画像"
                  fill={true}
                  priority
                  sizes="300px"
                />
              </div>
            </div>
          </div>

          {/* 日時・アイコン */}
          <div className="flex flex-col md:flex-row justify-between mt-auto items-end">
            <div className="flex items-center">
              <CiClock2 className="mr-1" />
              <span>{new Date(articleData.siteUpdatedAt).toLocaleDateString('sv-SE')}</span>
            </div>

            {/* アイコン */}
            <div className="relative z-20 mt-2 md:mt-6">
              <div className="flex justify-start md:justify-between gap-5 items-center text-xl">
                {/* お気に入りボタン */}
                <FaRegHeart />

                {/* アーカイブボタン */}
                <FaArchive />

                {/* デリートボタン */}
                <FaRegTrashCan />
              </div>
            </div>
          </div>
        </div>
        {/* 記事データここまで */}
      </div>
    </div>
  );
}

export default ArticleLists;
