-- CreateEnum
CREATE TYPE "CollaborationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Duration" AS ENUM ('Monthly', 'Annually');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FREE', 'BASIC', 'PREMIUM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELED');

-- CreateEnum
CREATE TYPE "invoiceStatus" AS ENUM ('OPEN', 'PAID', 'VOID');

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "collaborator_id" INTEGER NOT NULL,
    "budget_id" INTEGER NOT NULL,
    "status" "CollaborationStatus" NOT NULL DEFAULT 'PENDING',
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
    "start_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "duration" "Duration" NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEmail" (
    "id" SERIAL NOT NULL,
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "response_details" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaidItem" (
    "id" SERIAL NOT NULL,
    "plaid_item_id" TEXT,
    "user_id" INTEGER NOT NULL,
    "access_token" TEXT,
    "public_token" TEXT,
    "ins_id" TEXT NOT NULL,
    "manual" BOOLEAN NOT NULL DEFAULT false,
    "ins_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "manuallyDeleted" BOOLEAN NOT NULL DEFAULT false,

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
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "user_role" "UserRole" NOT NULL DEFAULT 'FREE',
    "device_token" TEXT NOT NULL,
    "widgetsAlreadyAdded" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" TEXT,
    "current_subscription_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "plaid_transaction_id" TEXT,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category_id" TEXT,
    "category_name" TEXT[],
    "date" TIMESTAMP(3) NOT NULL,
    "pending" BOOLEAN DEFAULT false,
    "manual" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "plaid_item_id" INTEGER,
    "institution_name" TEXT NOT NULL,
    "official_name" TEXT,
    "mask" TEXT,
    "type" TEXT,
    "subtype" TEXT,
    "institution_id" TEXT,
    "verification_status" TEXT,
    "current_balance" DOUBLE PRECISION NOT NULL,
    "available_balance" DOUBLE PRECISION NOT NULL,
    "iso_currency_code" TEXT NOT NULL,
    "manual" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
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
    "current_balance" DOUBLE PRECISION NOT NULL,
    "available_balance" DOUBLE PRECISION NOT NULL,
    "iso_currency_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentAccounts_pkey" PRIMARY KEY ("id")
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentHolding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentCategories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualInvestments" (
    "id" SERIAL NOT NULL,
    "data" JSONB[],
    "account_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "type" TEXT,
    "unofficial_currency_code" TEXT,
    "update_datetime" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentSecurity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionCategory" (
    "id" SERIAL NOT NULL,
    "category_id" TEXT NOT NULL,
    "hierarchy" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCategories" (
    "id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "category_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
CREATE TABLE "UserManualAssets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "asset_type_id" INTEGER NOT NULL,
    "asset_subtype_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserManualAssets_pkey" PRIMARY KEY ("id")
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
    "hasSubType" BOOLEAN NOT NULL DEFAULT true,
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
    "asset_type_id" INTEGER NOT NULL,
    "asset_sub_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT[],
    "order_id" INTEGER NOT NULL,
    "mandatory" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetFields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAssetsDetails" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "field_id" INTEGER NOT NULL,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAssetsDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forecast" (
    "id" SERIAL NOT NULL,
    "compound" VARCHAR(255) NOT NULL,
    "ins_id" INTEGER NOT NULL,
    "startingAmount" DOUBLE PRECISION NOT NULL,
    "returnRate" DOUBLE PRECISION NOT NULL,
    "investmentLength" INTEGER NOT NULL,
    "additionalContribution" DOUBLE PRECISION NOT NULL,
    "contributionFrequency" VARCHAR(255) NOT NULL,
    "contributionTiming" VARCHAR(255) NOT NULL,
    "accountIds" INTEGER[],
    "endBalance" DOUBLE PRECISION NOT NULL,
    "totalContributions" DOUBLE PRECISION NOT NULL,
    "totalInterest" DOUBLE PRECISION NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Widgets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userWidgets" (
    "id" SERIAL NOT NULL,
    "widget_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userWidgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liabilities" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "last_payment_date" TIMESTAMP(3) NOT NULL,
    "account_id" TEXT NOT NULL,
    "account_number" TEXT,
    "last_payment_amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "invoiceUrl" TEXT,
    "priceId" TEXT,
    "amount" INTEGER,
    "currency" TEXT,
    "interval" TEXT,
    "interval_count" INTEGER,
    "product" TEXT,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL,
    "invoiceStatus" "invoiceStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripe_customer_id_key" ON "User"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserDetails_user_id_key" ON "UserDetails"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_plaid_transaction_id_account_id_date_key" ON "Transaction"("plaid_transaction_id", "account_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_id_key" ON "Account"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentAccounts_account_id_key" ON "InvestmentAccounts"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentHolding_account_id_security_id_key" ON "InvestmentHolding"("account_id", "security_id");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentCategories_name_key" ON "InvestmentCategories"("name");

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

-- CreateIndex
CREATE UNIQUE INDEX "userWidgets_user_id_widget_id_key" ON "userWidgets"("user_id", "widget_id");

-- CreateIndex
CREATE UNIQUE INDEX "liabilities_last_payment_date_user_id_type_key" ON "liabilities"("last_payment_date", "user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_institution_id_key" ON "Institution"("institution_id");

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_budgets_category_id_fkey" FOREIGN KEY ("budgets_category_id") REFERENCES "BudgetCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "UserDetails" ADD CONSTRAINT "UserDetails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_plaid_item_id_fkey" FOREIGN KEY ("plaid_item_id") REFERENCES "PlaidItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentAccounts" ADD CONSTRAINT "InvestmentAccounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentAccounts" ADD CONSTRAINT "InvestmentAccounts_pliad_id_fkey" FOREIGN KEY ("pliad_id") REFERENCES "PlaidItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "UserManualAssets" ADD CONSTRAINT "UserManualAssets_asset_type_id_fkey" FOREIGN KEY ("asset_type_id") REFERENCES "AssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserManualAssets" ADD CONSTRAINT "UserManualAssets_asset_subtype_id_fkey" FOREIGN KEY ("asset_subtype_id") REFERENCES "AssetSubType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserManualAssets" ADD CONSTRAINT "UserManualAssets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserManualAssets" ADD CONSTRAINT "UserManualAssets_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "AssetFields" ADD CONSTRAINT "AssetFields_asset_type_id_fkey" FOREIGN KEY ("asset_type_id") REFERENCES "AssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssetsDetails" ADD CONSTRAINT "UserAssetsDetails_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "AssetFields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssetsDetails" ADD CONSTRAINT "UserAssetsDetails_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "UserManualAssets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_ins_id_fkey" FOREIGN KEY ("ins_id") REFERENCES "PlaidItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userWidgets" ADD CONSTRAINT "userWidgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userWidgets" ADD CONSTRAINT "userWidgets_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "Widgets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liabilities" ADD CONSTRAINT "liabilities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;