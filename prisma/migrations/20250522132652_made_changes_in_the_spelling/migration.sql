/*
  Warnings:

  - You are about to drop the column `Location` on the `Restaurant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "Location",
ADD COLUMN     "location" TEXT NOT NULL DEFAULT 'Unknown';
