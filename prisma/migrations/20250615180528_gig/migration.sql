-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_gigId_fkey";

-- AlterTable
ALTER TABLE "Deal" ALTER COLUMN "gigId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
