export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Sequelize: validaciones
  if (err?.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Sequelize: unique constraint (por ejemplo sku único)
  if (err?.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Conflicto: valor duplicado",
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Error interno",
  });
};
