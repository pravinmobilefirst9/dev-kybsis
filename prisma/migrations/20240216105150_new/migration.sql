/*
  Warnings:

  - You are about to drop the `Balance` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[account_id]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `available_balance` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current_balance` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iso_currency_code` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Balance" DROP CONSTRAINT "Balance_account_tbl_id_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "available_balance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "current_balance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "iso_currency_code" TEXT NOT NULL;

-- DropTable
DROP TABLE "Balance";

-- CreateTable
CREATE TABLE "Institution" (
    "id" SERIAL NOT NULL,
    "country_codes" TEXT[],
    "institution_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "oauth" BOOLEAN NOT NULL,
    "products" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_institution_id_key" ON "Institution"("institution_id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_id_key" ON "Account"("account_id");
