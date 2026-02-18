// backend/routes/producto.routes.js
import express from "express";
import {
  createProducto,
  getProductos,
  getProductoById,
  updateProducto,
  deleteProducto,
} from "../controllers/producto.controller.js";

import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { productoCreateSchema, productoUpdateSchema } from "../validators/producto.schema.js";

const router = express.Router();

router.post("/", validate(productoCreateSchema), asyncHandler(createProducto));
router.get("/", asyncHandler(getProductos));
router.get("/:idProducto", asyncHandler(getProductoById));
router.put("/:idProducto", validate(productoUpdateSchema), asyncHandler(updateProducto));
router.delete("/:idProducto", asyncHandler(deleteProducto));

export default router;
