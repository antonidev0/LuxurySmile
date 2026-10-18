-- CreateEnum
CREATE TYPE "Role" AS ENUM ('doctor', 'admin');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('hombre', 'mujer');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pendiente', 'confirmada', 'cancelada', 'completada');

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "numberId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "numberPhone" TEXT NOT NULL,
    "birthday" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "specialty" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'doctor',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'pendiente',
    "historialPDF" TEXT,
    "completedBy" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssignedDoctors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssignedDoctors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_numberId_key" ON "Staff"("numberId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_numberPhone_key" ON "Staff"("numberPhone");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Appointment_date_idx" ON "Appointment"("date");

-- CreateIndex
CREATE INDEX "_AssignedDoctors_B_index" ON "_AssignedDoctors"("B");

-- AddForeignKey
ALTER TABLE "_AssignedDoctors" ADD CONSTRAINT "_AssignedDoctors_A_fkey" FOREIGN KEY ("A") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedDoctors" ADD CONSTRAINT "_AssignedDoctors_B_fkey" FOREIGN KEY ("B") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
