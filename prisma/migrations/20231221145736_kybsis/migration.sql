/*
  Warnings:

  - You are about to drop the column `account_type` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `account_id` on the `Balance` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institution_id` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `official_name` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_tbl_id` to the `Balance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ins_id` to the `PlaidItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Balance" DROP CONSTRAINT "Balance_account_id_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "account_type",
ADD COLUMN     "account_id" TEXT NOT NULL,
ADD COLUMN     "institution_id" TEXT NOT NULL,
ADD COLUMN     "official_name" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Balance" DROP COLUMN "account_id",
ADD COLUMN     "account_tbl_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PlaidItem" ADD COLUMN     "ins_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "plaid_transaction_id" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "PlaidInstitutionImportHistory" (
    "id" SERIAL NOT NULL,
    "plaid_item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,
    "ins_id" TEXT NOT NULL,
    "imported_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaidInstitutionImportHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlaidInstitutionImportHistory" ADD CONSTRAINT "PlaidInstitutionImportHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidInstitutionImportHistory" ADD CONSTRAINT "PlaidInstitutionImportHistory_plaid_item_id_fkey" FOREIGN KEY ("plaid_item_id") REFERENCES "PlaidItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_account_tbl_id_fkey" FOREIGN KEY ("account_tbl_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
