// models/index.js
import { sequelize } from '../config/db.js';

import { defineCategoria } from './Categoria.js';
import { defineProvincia } from './Provincia.js';
import { defineCiudad } from './Ciudad.js';
import { defineUsuario } from './Usuario.js';
import { defineVendedor } from './Vendedor.js';
import { defineDireccion } from './Direccion.js';
import { defineTienda } from './Tienda.js';
import { defineProducto } from './Producto.js';
import { defineResenia } from './Resenia.js';
import { defineReseniaVendedor } from './ReseniaVendedor.js';
import { defineCarrito } from './Carrito.js';
import { defineCarritoItem } from './CarritoItem.js';

// Definir todos los modelos
const models = {
    Categoria: defineCategoria(sequelize),
    Provincia: defineProvincia(sequelize),
    Ciudad: defineCiudad(sequelize),
    Usuario: defineUsuario(sequelize),
    Vendedor: defineVendedor(sequelize),
    Direccion: defineDireccion(sequelize),
    Tienda: defineTienda(sequelize),
    Producto: defineProducto(sequelize),
    Resenia: defineResenia(sequelize),
    ReseniaVendedor: defineReseniaVendedor(sequelize),
    Carrito: defineCarrito(sequelize),
    CarritoItem: defineCarritoItem(sequelize),
};

// Asociaciones
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

export const {
    Categoria, Provincia, Ciudad, Usuario, Vendedor,
    Direccion, Tienda, Producto, Resenia, ReseniaVendedor, Carrito, CarritoItem
} = models;

export default models;