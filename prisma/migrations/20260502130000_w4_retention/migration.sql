-- W4 — User Retention 테이블 신설 (PostgreSQL prod 환경 대상)
-- UserBookShelf / EmailDispatchLog / PersonalRecommendCache 추가
-- prod 적용: npx prisma migrate deploy

-- CreateTable: UserBookShelf
CREATE TABLE "UserBookShelf" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rating" INTEGER,
    "oneLiner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBookShelf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBookShelf_userId_bookId_key" ON "UserBookShelf"("userId", "bookId");
CREATE INDEX "UserBookShelf_userId_status_idx" ON "UserBookShelf"("userId", "status");

-- AddForeignKey
ALTER TABLE "UserBookShelf" ADD CONSTRAINT "UserBookShelf_bookId_fkey"
    FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: EmailDispatchLog
CREATE TABLE "EmailDispatchLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailDispatchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailDispatchLog_type_targetId_idx" ON "EmailDispatchLog"("type", "targetId");

-- CreateTable: PersonalRecommendCache
CREATE TABLE "PersonalRecommendCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalRecommendCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalRecommendCache_userId_fingerprint_key" ON "PersonalRecommendCache"("userId", "fingerprint");
CREATE INDEX "PersonalRecommendCache_userId_idx" ON "PersonalRecommendCache"("userId");
