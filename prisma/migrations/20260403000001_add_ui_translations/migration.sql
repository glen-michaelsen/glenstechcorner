-- CreateTable
CREATE TABLE "UITranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locale" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UITranslation_locale_namespace_key_key" ON "UITranslation"("locale", "namespace", "key");
