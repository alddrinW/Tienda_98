// backend/controllers/producto.controller.js
import { Producto } from "../data/models/index.js";

// helper: permite solo ciertos campos al actualizar
const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]));

const UPDATABLE_FIELDS = [
  "idTienda",
  "nombre",
  "imagen_principal",
  "imagenes",
  "precio",
  "idCategoria",
  "sku",
  "stock",
  "activo",
  "precio_oferta",
  "caracteristicas_json",
  "especificaciones_json",
];

export const createProducto = async (req, res) => {
  const newProducto = await Producto.create(req.body);

  return res.status(201).json({
    success: true,
    data: newProducto,
    message: "Producto creado exitosamente",
  });
};

export const getProductos = async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  const offset = (page - 1) * limit;

  const { activo, idCategoria, idTienda, idVendedor } = req.query;

  const where = {};
  if (activo !== undefined) where.activo = activo === "true";
  if (idCategoria) where.idCategoria = Number(idCategoria);
  if (idTienda) where.idTienda = Number(idTienda);
  if (idVendedor) where.idVendedor = Number(idVendedor);

  const { count, rows } = await Producto.findAndCountAll({
    where,
    limit,
    offset,
    order: [["fecha_actualizacion", "DESC"]], // <- NO uses "id"
  });

  return res.status(200).json({
    success: true,
    meta: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    },
    data: rows,
  });
};

export const getProductoById = async (req, res) => {
  const { idProducto } = req.params;
  const producto = await Producto.findByPk(idProducto);

  if (!producto) {
    return res.status(404).json({
      success: false,
      message: "Producto no encontrado",
    });
  }

  return res.status(200).json({
    success: true,
    data: producto,
  });
};

export const updateProducto = async (req, res) => {
  const { idProducto } = req.params;
  const producto = await Producto.findByPk(idProducto);

  if (!producto) {
    return res.status(404).json({
      success: false,
      message: "Producto no encontrado",
    });
  }

  const payload = pick(req.body, UPDATABLE_FIELDS);
  await producto.update(payload);

  return res.status(200).json({
    success: true,
    data: producto,
    message: "Producto actualizado exitosamente",
  });
};

export const deleteProducto = async (req, res) => {
  const { idProducto } = req.params;
  const producto = await Producto.findByPk(idProducto);

  if (!producto) {
    return res.status(404).json({
      success: false,
      message: "Producto no encontrado",
    });
  }

  await producto.destroy();

  return res.status(200).json({
    success: true,
    message: "Producto eliminado exitosamente",
  });
};
