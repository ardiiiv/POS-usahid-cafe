-- AlterTable: tambah userName dengan default sementara
ALTER TABLE "Order" ADD COLUMN "userName" TEXT NOT NULL DEFAULT '';

-- Isi data lama dengan 'Unknown'
UPDATE "Order" SET "userName" = 'Unknown';

-- Hapus default setelah data terisi
ALTER TABLE "Order" ALTER COLUMN "userName" DROP DEFAULT;

-- AlterTable: userId jadi nullable
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;