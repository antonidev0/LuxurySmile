const DEFAULT_CODES = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  429: "TOO_MANY_REQUESTS",
  503: "SERVICE_UNAVAILABLE",
};

// Error esperado cuyo mensaje se puede mostrar al usuario tal cual.
// field indica el campo del formulario al que se refiere; details lleva datos extra para el front.
export class AppError extends Error {
  constructor(message, statusCode = 400, { code, field, details } = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? DEFAULT_CODES[statusCode] ?? "ERROR";
    this.field = field;
    this.details = details;
  }
}
