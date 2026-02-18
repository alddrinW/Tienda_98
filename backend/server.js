// Tienda_98/backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { testConnection } from "./data/config/db.js";
import productoRoutes from "./routes/producto.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middleware base
app.use(cors());
app.use(express.json());

// Healthcheck (simple y consistente)
app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true, message: "Servidor funcionando correctamente" });
});

// Rutas
app.use("/api/productos", productoRoutes);

// Error handler SIEMPRE al final
app.use(errorHandler);

// Puerto con fallback (por si .env no tiene PORT)
const PORT = process.env.PORT || 3000;

// Probar conexión BD antes de escuchar
(async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error("No se pudo conectar a la BD. Servidor no iniciado.");
    console.error(err);
    process.exit(1);
  }
})();
