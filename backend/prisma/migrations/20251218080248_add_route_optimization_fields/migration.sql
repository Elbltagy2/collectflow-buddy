-- AlterTable
ALTER TABLE "collector_visits" ADD COLUMN     "optimizedAt" TIMESTAMP(3),
ADD COLUMN     "optimizedDistance" DOUBLE PRECISION,
ADD COLUMN     "optimizedDuration" DOUBLE PRECISION;
