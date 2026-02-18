export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Datos inválidos",
      errors: result.error.flatten(),
    });
  }

  // Body ya validado/sanitizado
  req.body = result.data;
  next();
};
