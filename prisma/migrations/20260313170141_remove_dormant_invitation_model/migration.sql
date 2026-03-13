/*
  Warnings:

  - You are about to drop the `invitations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_invited_by_id_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_organization_id_fkey";

-- DropTable
DROP TABLE "invitations";

-- DropEnum
DROP TYPE "InvitationStatus";
