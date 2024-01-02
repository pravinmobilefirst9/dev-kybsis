/*
  Warnings:

  - Added the required column `field_id` to the `UserAssetsDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAssetsDetails" ADD COLUMN     "field_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserAssetsDetails" ADD CONSTRAINT "UserAssetsDetails_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "AssetFields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
