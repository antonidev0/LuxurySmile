import { z } from "zod";
import { id, optionalId } from "./common.js";

export const recordParams = z.object({ appointmentId: id });

// El contenido de la ficha (campos conocidos, fechas, opciones) lo valida y limpia sanitizeFicha
export const saveRecordBody = z.object({
  recordId: optionalId,
  data: z.record(z.string(), z.unknown(), "Datos de la ficha inválidos"),
});
