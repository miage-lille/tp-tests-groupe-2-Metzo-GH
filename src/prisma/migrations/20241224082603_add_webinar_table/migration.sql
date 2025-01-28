-- CreateTable
CREATE TABLE "Webinar" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "seats" INTEGER NOT NULL,
    "organizerId" TEXT NOT NULL,

    CONSTRAINT "Webinar_pkey" PRIMARY KEY ("id")
);
