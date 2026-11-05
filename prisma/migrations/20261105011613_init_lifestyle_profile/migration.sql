-- CreateTable
CREATE TABLE "LifestyleProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minBudget" DOUBLE PRECISION NOT NULL,
    "maxBudget" DOUBLE PRECISION NOT NULL,
    "preferredZones" TEXT[],
    "hasPets" BOOLEAN NOT NULL DEFAULT false,
    "toleratesPets" BOOLEAN NOT NULL DEFAULT true,
    "isSmoker" BOOLEAN NOT NULL DEFAULT false,
    "toleratesSmokers" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifestyleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LifestyleProfile_userId_key" ON "LifestyleProfile"("userId");

-- AddForeignKey
ALTER TABLE "LifestyleProfile" ADD CONSTRAINT "LifestyleProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
