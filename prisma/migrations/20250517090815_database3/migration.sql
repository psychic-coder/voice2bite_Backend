/*
  Warnings:

  - Added the required column `role` to the `CompanyAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photoUrl` to the `FoodItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `HotelAdmin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photoUrl` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompanyAdmin" ADD COLUMN     "role" "UserRole" NOT NULL;

-- AlterTable
ALTER TABLE "FoodItem" ADD COLUMN     "photoUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HotelAdmin" ADD COLUMN     "role" "UserRole" NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "photoUrl" TEXT NOT NULL;
