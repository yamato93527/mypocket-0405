"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, type MouseEvent } from "react";
import { CiClock2 } from "react-icons/ci";
import { FaArchive, FaHeart, FaRegHeart } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import type { Article } from "@/lib/generated/prisma/client";
import { deleteArticle } from "../actions/articles/delete-article";
import { toggleArticleArchive } from "../actions/articles/toggle-article-archive";
import { toggleArticleLike } from "../actions/articles/toggle-article-like";

type ArticleCardProps = {
  article: Article;
};

function ArticleCard({ article }: ArticleCardProps) {
  const [isLiked, setIsLiked] = useState(article.isLiked);
  const [isArchived, setIsArchived] = useState(article.isArchived);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isDeleted) {
    return null;
  }

  const handleToggleLike = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);

    startTransition(async () => {
      const result = await toggleArticleLike(article.id, nextLiked);

      if (!result.success) {
        setIsLiked(!nextLiked);
        window.alert(result.errorMessage);
      }
    });
  };

  const handleToggleArchive = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const nextArchived = !isArchived;
    setIsArchived(nextArchived);

    startTransition(async () => {
      const result = await toggleArticleArchive(article.id, nextArchived);

      if (!result.success) {
        setIsArchived(!nextArchived);
        window.alert(result.errorMessage);
      }
    });
  };

  const handleDelete = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDeleted(true);

    startTransition(async () => {
      const result = await deleteArticle(article.id);

      if (!result.success) {
        setIsDeleted(false);
        window.alert(result.errorMessage);
      }
    });
  };

  return (
    <div className="border border-gray-400 bg-white group hover:bg-gray-50 transition-colors px-3 py-3">
      <div className="flex justify-between gap-4 flex-col-reverse md:flex-row">
        <div className="w-full md:w-3/5 lg:w-4/5 flex flex-col min-w-0">
          <Link href={article.url} className="block">
            <div className="mb-2">
              <h3 className="font-bold text-2xl leading-tight mb-1 line-clamp-2">
                {article.title}
              </h3>
              <span className="text-gray-400 text-sm">{article.siteName}</span>
            </div>

            <div className="mb-3">
              <p className="line-clamp-3 text-gray-700 text-lg leading-relaxed">
                {article.description}
              </p>
            </div>
          </Link>

          <div className="flex justify-between items-center mt-auto gap-3">
            <Link href={article.url} className="flex items-center text-xl shrink-0">
              <CiClock2 className="mr-1" />
              <span className="text-2xl">
                {new Date(article.siteUpdatedAt).toLocaleDateString("sv-SE")}
              </span>
            </Link>

            <div className="relative z-20">
              <div className="flex gap-4 items-center text-2xl">
                <button
                  type="button"
                  aria-label={isLiked ? "お気に入りを解除" : "お気に入りに追加"}
                  aria-pressed={isLiked}
                  className="cursor-pointer disabled:cursor-not-allowed"
                  disabled={isPending}
                  onClick={handleToggleLike}
                >
                  {isLiked ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>

                <button
                  type="button"
                  aria-label={isArchived ? "アーカイブを解除" : "アーカイブする"}
                  aria-pressed={isArchived}
                  className="cursor-pointer disabled:cursor-not-allowed"
                  disabled={isPending}
                  onClick={handleToggleArchive}
                >
                  <FaArchive className={isArchived ? "text-red-500" : ""} />
                </button>

                <button
                  type="button"
                  aria-label="記事を削除"
                  className="cursor-pointer disabled:cursor-not-allowed"
                  disabled={isPending}
                  onClick={handleDelete}
                >
                  <FaRegTrashCan />
                </button>
              </div>
            </div>
          </div>
        </div>

        <Link
          href={article.url}
          className="w-full md:w-2/5 lg:w-1/5 aspect-[16/9] md:aspect-[3/2] shrink-0 block"
        >
          <div className="relative w-full h-full overflow-hidden bg-white">
            {article.thumbnail ? (
              <Image
                className="object-contain object-center p-2"
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
        </Link>
      </div>
    </div>
  );
}

export default ArticleCard;
