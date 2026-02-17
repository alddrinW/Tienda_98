import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './data/config/db.js';

import tiendaRoutes from './routes/tienda.routes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/api/tiendas', tiendaRoutes);

app.get('/api/health', (req, res) => {
    res.send('Servidor funcionando correctamente');
})

//probar conexion bd

testConnection();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});