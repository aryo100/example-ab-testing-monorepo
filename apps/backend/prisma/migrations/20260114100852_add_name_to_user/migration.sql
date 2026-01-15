-- AlterTable: Add name column with default value for existing rows
ALTER TABLE "users" ADD COLUMN "name" TEXT;

-- Update existing rows with a default name
UPDATE "users" SET "name" = 'Unknown User' WHERE "name" IS NULL;

-- Make the column required
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
