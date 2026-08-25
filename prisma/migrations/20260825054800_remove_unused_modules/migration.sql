/*
  Warnings:

  - You are about to drop the `Amenities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogCategories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogFaq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CareerGallery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CityEcosystemLifestyle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CitySectionLists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CitySections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InverstorTabs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Locality` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `News` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NriWhy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OfficesLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectFaq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectRera` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `State` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `csrContentDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `csrContentGalleries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Amenities" DROP CONSTRAINT "Amenities_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Amenities" DROP CONSTRAINT "Amenities_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "BlogCategories" DROP CONSTRAINT "BlogCategories_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "BlogCategories" DROP CONSTRAINT "BlogCategories_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "BlogFaq" DROP CONSTRAINT "BlogFaq_blogId_fkey";

-- DropForeignKey
ALTER TABLE "BlogFaq" DROP CONSTRAINT "BlogFaq_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "BlogFaq" DROP CONSTRAINT "BlogFaq_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "CareerGallery" DROP CONSTRAINT "CareerGallery_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "CareerGallery" DROP CONSTRAINT "CareerGallery_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "CityEcosystemLifestyle" DROP CONSTRAINT "CityEcosystemLifestyle_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "CityEcosystemLifestyle" DROP CONSTRAINT "CityEcosystemLifestyle_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "CitySections" DROP CONSTRAINT "CitySections_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "CitySections" DROP CONSTRAINT "CitySections_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "Country" DROP CONSTRAINT "Country_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Country" DROP CONSTRAINT "Country_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "InverstorTabs" DROP CONSTRAINT "InverstorTabs_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "InverstorTabs" DROP CONSTRAINT "InverstorTabs_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "News" DROP CONSTRAINT "News_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "News" DROP CONSTRAINT "News_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "NriWhy" DROP CONSTRAINT "NriWhy_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "NriWhy" DROP CONSTRAINT "NriWhy_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "OfficesLocation" DROP CONSTRAINT "OfficesLocation_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "OfficesLocation" DROP CONSTRAINT "OfficesLocation_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "ProjectFaq" DROP CONSTRAINT "ProjectFaq_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "ProjectFaq" DROP CONSTRAINT "ProjectFaq_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectFaq" DROP CONSTRAINT "ProjectFaq_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMedia" DROP CONSTRAINT "ProjectMedia_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMedia" DROP CONSTRAINT "ProjectMedia_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMedia" DROP CONSTRAINT "ProjectMedia_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "ProjectRera" DROP CONSTRAINT "ProjectRera_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "ProjectRera" DROP CONSTRAINT "ProjectRera_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_countryId_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "State" DROP CONSTRAINT "State_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "csrContentDetails" DROP CONSTRAINT "csrContentDetails_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "csrContentDetails" DROP CONSTRAINT "csrContentDetails_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "csrContentGalleries" DROP CONSTRAINT "csrContentGalleries_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "csrContentGalleries" DROP CONSTRAINT "csrContentGalleries_updatedBy_fkey";

-- DropTable
DROP TABLE "Amenities";

-- DropTable
DROP TABLE "BlogCategories";

-- DropTable
DROP TABLE "BlogFaq";

-- DropTable
DROP TABLE "CareerGallery";

-- DropTable
DROP TABLE "CityEcosystemLifestyle";

-- DropTable
DROP TABLE "CitySectionLists";

-- DropTable
DROP TABLE "CitySections";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "InverstorTabs";

-- DropTable
DROP TABLE "Locality";

-- DropTable
DROP TABLE "News";

-- DropTable
DROP TABLE "NriWhy";

-- DropTable
DROP TABLE "OfficesLocation";

-- DropTable
DROP TABLE "ProjectFaq";

-- DropTable
DROP TABLE "ProjectMedia";

-- DropTable
DROP TABLE "ProjectRera";

-- DropTable
DROP TABLE "State";

-- DropTable
DROP TABLE "csrContentDetails";

-- DropTable
DROP TABLE "csrContentGalleries";

-- DropEnum
DROP TYPE "CityContentDetailTypes";

-- DropEnum
DROP TYPE "CitySectionTypes";

-- DropEnum
DROP TYPE "MediaType";

-- DropEnum
DROP TYPE "PartnerType";

-- DropEnum
DROP TYPE "ProjectAmenityTypes";

-- DropEnum
DROP TYPE "ProjectContentDetailsTypes";

-- DropEnum
DROP TYPE "ProjectGalleryTypes";

-- DropEnum
DROP TYPE "TestimonialType";

-- DropEnum
DROP TYPE "csrContentTypes";
