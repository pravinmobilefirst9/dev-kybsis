/*
  Warnings:

  - A unique constraint covering the columns `[account_id]` on the table `InvestmentAccounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `asset_id` to the `AssetFields` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetFields" ADD COLUMN     "asset_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "InvestmentHolding" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "cost_basis" DOUBLE PRECISION NOT NULL,
    "institution_price" DOUBLE PRECISION NOT NULL,
    "institution_price_as_of" TIMESTAMP(3),
    "institution_price_datetime" TIMESTAMP(3),
    "institution_value" DOUBLE PRECISION NOT NULL,
    "iso_currency_code" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "security_id" TEXT NOT NULL,
    "unofficial_currency_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentHolding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentHolding_account_id_security_id_key" ON "InvestmentHolding"("account_id", "security_id");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentAccounts_account_id_key" ON "InvestmentAccounts"("account_id");

-- AddForeignKey
ALTER TABLE "InvestmentHolding" ADD CONSTRAINT "InvestmentHolding_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "InvestmentAccounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentHolding" ADD CONSTRAINT "InvestmentHolding_security_id_fkey" FOREIGN KEY ("security_id") REFERENCES "InvestmentSecurity"("security_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetFields" ADD CONSTRAINT "AssetFields_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "AssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
