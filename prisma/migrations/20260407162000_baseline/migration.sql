-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "description" TEXT,
    "siteUpdatedAt" TEXT NOT NULL,
    "thumbnail" TEXT,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "isLiked" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_url_key" ON "public"."articles"("url" ASC);
