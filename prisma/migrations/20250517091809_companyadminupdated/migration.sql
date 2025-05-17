/*
  Warnings:

  - Added the required column `photoUrl` to the `CompanyAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompanyAdmin" ADD COLUMN     "photoUrl" TEXT NOT NULL;
