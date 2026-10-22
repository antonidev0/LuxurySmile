-- CreateEnum
CREATE TYPE "AppointmentEventType" AS ENUM ('creada', 'estado', 'doctores', 'reprogramada', 'nota');

-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'no_asistio';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "previousAppointmentId" TEXT;

-- CreateTable
CREATE TABLE "AppointmentEvent" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "type" "AppointmentEventType" NOT NULL,
    "fromStatus" "AppointmentStatus",
    "toStatus" "AppointmentStatus",
    "fromDoctors" JSONB,
    "toDoctors" JSONB,
    "fromDate" DATE,
    "toDate" DATE,
    "fromTime" TEXT,
    "toTime" TEXT,
    "reason" TEXT,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "actorRole" "Role",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppointmentEvent_appointmentId_createdAt_idx" ON "AppointmentEvent"("appointmentId", "createdAt");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_previousAppointmentId_fkey" FOREIGN KEY ("previousAppointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentEvent" ADD CONSTRAINT "AppointmentEvent_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- El historial solo admite nuevas entradas: se bloquea editarlas o borrarlas
CREATE FUNCTION "appointment_event_read_only"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'El historial de citas no se puede modificar ni borrar';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AppointmentEvent_read_only"
BEFORE UPDATE OR DELETE ON "AppointmentEvent"
FOR EACH ROW EXECUTE FUNCTION "appointment_event_read_only"();
