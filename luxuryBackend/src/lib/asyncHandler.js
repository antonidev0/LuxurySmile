// Express 4 no captura los rechazos de promesas: sin esto un error async dejaría la petición colgada
export const asyncHandler = (handler) => async (request, response, next) => {
  try {
    await handler(request, response, next);
  } catch (error) {
    next(error);
  }
};
