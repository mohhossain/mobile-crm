/*
  Warnings:

  - You are about to drop the column `contactId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_contactId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "contactId";

-- CreateTable
CREATE TABLE "_ContactToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContactToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ContactToTask_B_index" ON "_ContactToTask"("B");

-- AddForeignKey
ALTER TABLE "_ContactToTask" ADD CONSTRAINT "_ContactToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToTask" ADD CONSTRAINT "_ContactToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
