/*
  Warnings:

  - The values [csr] on the enum `FaqTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FaqTypes_new" AS ENUM ('faq', 'nri', 'about', 'tax_benefit', 'emi', 'investor', 'career', 'home');
ALTER TABLE "Faqs" ALTER COLUMN "type" TYPE "FaqTypes_new" USING ("type"::text::"FaqTypes_new");
ALTER TYPE "FaqTypes" RENAME TO "FaqTypes_old";
ALTER TYPE "FaqTypes_new" RENAME TO "FaqTypes";
DROP TYPE "public"."FaqTypes_old";
COMMIT;
