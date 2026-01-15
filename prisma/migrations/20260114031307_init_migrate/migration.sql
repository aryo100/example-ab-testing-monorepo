-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'VIEWER');

-- CreateEnum
CREATE TYPE "FlagType" AS ENUM ('BOOLEAN', 'PERCENTAGE', 'VARIANT');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "FlagType" NOT NULL DEFAULT 'BOOLEAN',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_variants" (
    "id" UUID NOT NULL,
    "flag_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "flag_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "environments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flag_targets" (
    "id" UUID NOT NULL,
    "flag_id" UUID NOT NULL,
    "environment_id" UUID NOT NULL,
    "percentage" INTEGER NOT NULL DEFAULT 100,
    "constraints" JSONB,

    CONSTRAINT "flag_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "flag_id" UUID NOT NULL,
    "metrics" JSONB,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'DRAFT',
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exposures" (
    "id" UUID NOT NULL,
    "user_id" TEXT,
    "flag_id" UUID NOT NULL,
    "variant_key" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "exposures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversions" (
    "id" UUID NOT NULL,
    "exposure_id" UUID,
    "experiment_id" UUID NOT NULL,
    "metric_key" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aggregates" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "flag_id" UUID NOT NULL,
    "variant_key" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE UNIQUE INDEX "flag_variants_flag_id_key_key" ON "flag_variants"("flag_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "environments_name_key" ON "environments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "flag_targets_flag_id_environment_id_key" ON "flag_targets"("flag_id", "environment_id");

-- CreateIndex
CREATE INDEX "exposures_flag_id_timestamp_idx" ON "exposures"("flag_id", "timestamp");

-- CreateIndex
CREATE INDEX "exposures_user_id_idx" ON "exposures"("user_id");

-- CreateIndex
CREATE INDEX "conversions_experiment_id_timestamp_idx" ON "conversions"("experiment_id", "timestamp");

-- CreateIndex
CREATE INDEX "conversions_metric_key_idx" ON "conversions"("metric_key");

-- CreateIndex
CREATE INDEX "aggregates_flag_id_date_idx" ON "aggregates"("flag_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "aggregates_date_flag_id_variant_key_key" ON "aggregates"("date", "flag_id", "variant_key");

-- AddForeignKey
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_variants" ADD CONSTRAINT "flag_variants_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_targets" ADD CONSTRAINT "flag_targets_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flag_targets" ADD CONSTRAINT "flag_targets_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exposures" ADD CONSTRAINT "exposures_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_exposure_id_fkey" FOREIGN KEY ("exposure_id") REFERENCES "exposures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aggregates" ADD CONSTRAINT "aggregates_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
