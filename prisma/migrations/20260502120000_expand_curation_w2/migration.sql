-- W2 Curation 매거진 필드 확장 (PostgreSQL prod 환경 대상)
-- 기존 마이그레이션은 SQLite 양식이지만 prod datasource는 postgresql임.
-- 본 마이그레이션은 prod 적용용 ALTER TABLE 문장으로 작성됨.
-- dev sqlite 사용 시에는 `npx prisma db push`로 schema만 동기화 권장.

-- AlterTable
ALTER TABLE "Curation" ADD COLUMN "slug" TEXT;
ALTER TABLE "Curation" ADD COLUMN "category" TEXT;
ALTER TABLE "Curation" ADD COLUMN "curatorNote" TEXT;
ALTER TABLE "Curation" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Curation" ADD COLUMN "seoDesc" TEXT;
ALTER TABLE "Curation" ADD COLUMN "ogImage" TEXT;
ALTER TABLE "Curation" ADD COLUMN "readingTime" INTEGER;
ALTER TABLE "Curation" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "Curation" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE "Curation" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Curation" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Curation_slug_key" ON "Curation"("slug");
