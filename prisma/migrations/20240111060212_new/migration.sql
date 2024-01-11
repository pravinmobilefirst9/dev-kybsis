-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BASIC', 'PREMIUM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "collaborator_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "budgets_category_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "set_limit" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEmail" (
    "id" SERIAL NOT NULL,
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "response_details" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL,
    "updated_at" INTEGER NOT NULL,

    CONSTRAINT "UserEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionAccount" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plaid_account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "institution_name" TEXT NOT NULL,
    "mask" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "available_balance" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaidItem" (
    "id" SERIAL NOT NULL,
    "plaid_item_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,
    "public_token" TEXT NOT NULL,
    "ins_id" TEXT NOT NULL,
    "ins_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaidItem_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "user_otp" INTEGER NOT NULL,
    "user_otp_createdAt" TIMESTAMP(3),
    "user_role" "UserRole" NOT NULL DEFAULT 'BASIC',
    "device_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "goal_category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDetails" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "dateofbirth" TIMESTAMP(3) NOT NULL,
    "phonenumber" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "plaid_transaction_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category_id" TEXT NOT NULL,
    "category_name" TEXT[],
    "date" TIMESTAMP(3) NOT NULL,
    "pending" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "institution_name" TEXT NOT NULL,
    "official_name" TEXT NOT NULL,
    "mask" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" SERIAL NOT NULL,
    "account_tbl_id" INTEGER NOT NULL,
    "current_balance" DOUBLE PRECISION NOT NULL,
    "available_balance" DOUBLE PRECISION NOT NULL,
    "iso_currency_code" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentAccounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pliad_id" INTEGER NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "official_name" TEXT,
    "mask" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentTransactions" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "cancel_transaction_id" TEXT DEFAULT 'NA',
    "amount" DOUBLE PRECISION NOT NULL,
    "date_of_transaction" TIMESTAMP(3) NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "investment_transaction_id" TEXT NOT NULL,
    "iso_currency_code" TEXT,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "security_id" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unofficial_currency_code" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'plaid',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentBalance" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "current_balance" DOUBLE PRECISION NOT NULL,
    "available_balance" DOUBLE PRECISION NOT NULL,
    "iso_currency_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentBalance_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "InvestmentCategories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualInvestments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "purchase_price" INTEGER NOT NULL,
    "current_price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualInvestments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentSecurity" (
    "id" SERIAL NOT NULL,
    "security_id" TEXT NOT NULL,
    "close_price" DOUBLE PRECISION,
    "close_price_as_of" TIMESTAMP(3),
    "cusip" TEXT,
    "institution_id" TEXT,
    "institution_security_id" TEXT,
    "is_cash_equivalent" BOOLEAN NOT NULL,
    "isin" TEXT,
    "iso_currency_code" TEXT NOT NULL,
    "market_identifier_code" TEXT,
    "name" TEXT,
    "option_contract" TEXT,
    "proxy_security_id" TEXT,
    "sedol" TEXT,
    "ticker_symbol" TEXT,
    "type" TEXT NOT NULL,
    "unofficial_currency_code" TEXT,
    "update_datetime" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentSecurity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionCategory" (
    "id" SERIAL NOT NULL,
    "category_id" TEXT NOT NULL,
    "hierarchy" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCategories" (
    "id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "category_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaidAssetItem" (
    "id" SERIAL NOT NULL,
    "asset_report_token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plaid_item_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaidAssetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAccount" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "plaid_asset_item_id" INTEGER NOT NULL,
    "balance_available" DECIMAL(65,30),
    "balance_current" DECIMAL(65,30) NOT NULL,
    "iso_currency_code" TEXT,
    "balance_limit" DECIMAL(65,30),
    "unofficial_currency_code" TEXT,
    "days_available" INTEGER,
    "user_id" INTEGER NOT NULL,
    "mask" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownership_type" TEXT,
    "subtype" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetHistoricalBalance" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "balance_date" TIMESTAMP(3) NOT NULL,
    "balance_amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetHistoricalBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetTransaction" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "date_transacted" TIMESTAMP(3) NOT NULL,
    "transaction_name" TEXT NOT NULL,
    "transaction_amount" DECIMAL(65,30) NOT NULL,
    "transaction_currency" TEXT,
    "check_number" TEXT,
    "merchant_name" TEXT,
    "pending" BOOLEAN NOT NULL,
    "category_id" TEXT NOT NULL,
    "category" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriptions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetSubType" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetSubType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetFields" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "asset_sub_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT[],
    "order_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetFields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAssetsDetails" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "asset_sub_id" INTEGER NOT NULL,
    "field_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAssetsDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserDetails_user_id_key" ON "UserDetails"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_plaid_transaction_id_account_id_date_key" ON "Transaction"("plaid_transaction_id", "account_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentAccounts_account_id_key" ON "InvestmentAccounts"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentTransactions_account_id_investment_transaction_id_key" ON "InvestmentTransactions"("account_id", "investment_transaction_id", "date_of_transaction");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentHolding_account_id_security_id_key" ON "InvestmentHolding"("account_id", "security_id");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentSecurity_security_id_key" ON "InvestmentSecurity"("security_id");

-- CreateIndex
CREATE UNIQUE INDEX "PlaidAssetItem_plaid_item_id_key" ON "PlaidAssetItem"("plaid_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "AssetAccount_account_id_key" ON "AssetAccount"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "AssetHistoricalBalance_account_id_balance_date_key" ON "AssetHistoricalBalance"("account_id", "balance_date");

-- CreateIndex
CREATE UNIQUE INDEX "AssetTransaction_account_id_transaction_id_transaction_type_key" ON "AssetTransaction"("account_id", "transaction_id", "transaction_type", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriptions_name_key" ON "Subscriptions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_user_id_key" ON "UserSubscription"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_subscription_id_key" ON "UserSubscription"("subscription_id");

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionAccount" ADD CONSTRAINT "InstitutionAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidItem" ADD CONSTRAINT "PlaidItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidInstitutionImportHistory" ADD CONSTRAINT "PlaidInstitutionImportHistory_plaid_item_id_fkey" FOREIGN KEY ("plaid_item_id") REFERENCES "PlaidItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidInstitutionImportHistory" ADD CONSTRAINT "PlaidInstitutionImportHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_goal_category_id_fkey" FOREIGN KEY ("goal_category_id") REFERENCES "GoalCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDetails" ADD CONSTRAINT "UserDetails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_account_tbl_id_fkey" FOREIGN KEY ("account_tbl_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentAccounts" ADD CONSTRAINT "InvestmentAccounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentAccounts" ADD CONSTRAINT "InvestmentAccounts_pliad_id_fkey" FOREIGN KEY ("pliad_id") REFERENCES "PlaidItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentTransactions" ADD CONSTRAINT "InvestmentTransactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "InvestmentAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentBalance" ADD CONSTRAINT "InvestmentBalance_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "InvestmentAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentHolding" ADD CONSTRAINT "InvestmentHolding_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "InvestmentAccounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentHolding" ADD CONSTRAINT "InvestmentHolding_security_id_fkey" FOREIGN KEY ("security_id") REFERENCES "InvestmentSecurity"("security_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualInvestments" ADD CONSTRAINT "ManualInvestments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualInvestments" ADD CONSTRAINT "ManualInvestments_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "InvestmentCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidAssetItem" ADD CONSTRAINT "PlaidAssetItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidAssetItem" ADD CONSTRAINT "PlaidAssetItem_plaid_item_id_fkey" FOREIGN KEY ("plaid_item_id") REFERENCES "PlaidItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAccount" ADD CONSTRAINT "AssetAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAccount" ADD CONSTRAINT "AssetAccount_plaid_asset_item_id_fkey" FOREIGN KEY ("plaid_asset_item_id") REFERENCES "PlaidAssetItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHistoricalBalance" ADD CONSTRAINT "AssetHistoricalBalance_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "AssetAccount"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTransaction" ADD CONSTRAINT "AssetTransaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "AssetAccount"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetSubType" ADD CONSTRAINT "AssetSubType_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "AssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetFields" ADD CONSTRAINT "AssetFields_asset_sub_id_fkey" FOREIGN KEY ("asset_sub_id") REFERENCES "AssetSubType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetFields" ADD CONSTRAINT "AssetFields_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "AssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssetsDetails" ADD CONSTRAINT "UserAssetsDetails_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "AssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssetsDetails" ADD CONSTRAINT "UserAssetsDetails_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "AssetFields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssetsDetails" ADD CONSTRAINT "UserAssetsDetails_asset_sub_id_fkey" FOREIGN KEY ("asset_sub_id") REFERENCES "AssetSubType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssetsDetails" ADD CONSTRAINT "UserAssetsDetails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
