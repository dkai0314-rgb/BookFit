-- CreateTable
CREATE TABLE "MonthlyBestseller" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "snapshotMonth" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "isbn13" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "categoryName" TEXT,
    "description" TEXT,
    "link" TEXT,
    "source" TEXT NOT NULL DEFAULT 'aladin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "summary" TEXT,
    "imageUrl" TEXT,
    "purchaseLink" TEXT,
    "isChoice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "MonthlyBestseller_snapshotMonth_rank_idx" ON "MonthlyBestseller"("snapshotMonth", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBestseller_snapshotMonth_isbn13_key" ON "MonthlyBestseller"("snapshotMonth", "isbn13");
