-- CreateTable
CREATE TABLE "admin_wallet_transactions" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "depositId" TEXT NOT NULL,

    CONSTRAINT "admin_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_wallet_transactions_depositId_key" ON "admin_wallet_transactions"("depositId");

-- AddForeignKey
ALTER TABLE "admin_wallet_transactions" ADD CONSTRAINT "admin_wallet_transactions_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "deposits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
