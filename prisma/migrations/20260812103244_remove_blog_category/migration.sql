/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Blogs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Blogs" DROP CONSTRAINT "Blogs_categoryId_fkey";

-- AlterTable
ALTER TABLE "Blogs" DROP COLUMN "categoryId";
