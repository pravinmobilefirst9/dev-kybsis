/*
  Warnings:

  - Changed the type of `duration` on the `Budget` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `budget_id` to the `Collaboration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Duration" AS ENUM ('Monthly', 'Annually');

-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "set_limit" DROP NOT NULL,
DROP COLUMN "duration",
ADD COLUMN     "duration" "Duration" NOT NULL;

-- AlterTable
ALTER TABLE "Collaboration" ADD COLUMN     "budget_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "InvestmentTransactions" ALTER COLUMN "subtype" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "platform" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
