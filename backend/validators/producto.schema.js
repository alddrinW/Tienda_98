import { z } from "zod";

const urlString = z.string().min(1).max(255); // en BD es VARCHAR(255), no necesariamente URL real

const productoBaseSchema = z.object({
  idTienda: z.coerce.number().int().positive().nullable().optional(), // puede ser null
  idVendedor: z.coerce.number().int().positive(), // NOT NULL

  nombre: z.string().min(1).max(150), // BD: VARCHAR(150) NOT NULL

  imagen_principal: urlString, // NOT NULL en BD
  imagenes: z.any().optional().nullable(), // BD: JSON (puedes mandarlo como array/obj)

  precio: z.coerce.number().nonnegative(), // DECIMAL(12,2)
  idCategoria: z.coerce.number().int().positive(), // NOT NULL

  sku: z.string().min(1).max(100).optional().nullable(), // UNIQUE pero puede venir null

  stock: z.coerce.number().int().nonnegative().optional().default(0), // UNSIGNED DEFAULT 0
  activo: z.coerce.boolean().optional().default(false), // DEFAULT FALSE
  precio_oferta: z.coerce.number().nonnegative().nullable().optional(), // DEFAULT NULL

  caracteristicas_json: z.any(), // NOT NULL en BD
  especificaciones_json: z.any(), // NOT NULL en BD
});

// CREATE: regla negocio oferta <= precio
export const productoCreateSchema = productoBaseSchema.refine(
  (d) => d.precio_oferta == null || d.precio_oferta <= d.precio,
  { message: "precio_oferta no puede ser mayor que precio", path: ["precio_oferta"] }
);

// UPDATE: parcial + validación solo si vienen ambos campos
export const productoUpdateSchema = productoBaseSchema
  .partial()
  .superRefine((d, ctx) => {
    if (d.precio != null && d.precio_oferta != null && d.precio_oferta > d.precio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "precio_oferta no puede ser mayor que precio",
        path: ["precio_oferta"],
      });
    }
  });
