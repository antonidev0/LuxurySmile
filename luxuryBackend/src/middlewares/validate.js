import { AppError } from "../lib/AppError.js";

const toValidationError = (zodError) => {
  const issues = zodError.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));
  const [first] = issues;
  return new AppError(first.message, 400, {
    code: "VALIDATION_ERROR",
    field: first.field || undefined,
    details: issues,
  });
};

// Valida y normaliza body, params y/o query con zod antes de llegar al controller.
// Lo que llega al controller es el resultado del esquema: sin campos desconocidos y ya recortado.
export const validate = (schemas) => (request, response, next) => {
  for (const [part, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(request[part] ?? {});
    if (!result.success) return next(toValidationError(result.error));
    request[part] = result.data;
  }
  next();
};
