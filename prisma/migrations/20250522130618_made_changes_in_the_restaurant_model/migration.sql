-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "Location" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "category" TEXT[],
ADD COLUMN     "desc" TEXT NOT NULL DEFAULT 'No description available',
ADD COLUMN     "hotelTags" TEXT[],
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 0;
