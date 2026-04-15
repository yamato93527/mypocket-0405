-- DropIndex
DROP INDEX IF EXISTS "articles_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "articles_userId_url_key" ON "public"."articles"("userId", "url");
