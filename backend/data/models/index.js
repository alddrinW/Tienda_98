// models/index.js
import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

import { defineCategoria } from './Categoria.js';
import { defineProvincia } from './Provincia.js';
import { defineCiudad } from './Ciudad.js';
import { defineUsuario } from './Usuario.js';
import { defineVendedor } from './Vendedor.js';
import { defineDireccion } from './Direccion.js';
// Tienda model removed as it is merged with Vendedor in the new schema
import { defineProducto } from './Producto.js';
import { defineProductoVariante } from './ProductoVariante.js'; // New
import { defineProductoTag } from './ProductoTag.js'; // New
import { defineResenia } from './Resenia.js';
import { defineCarrito } from './Carrito.js';
import { defineCarritoItem } from './CarritoItem.js';
import { defineOrden } from './Orden.js'; // New
import { defineOrdenItem } from './OrdenItem.js'; // New
import { defineDeseos } from './Deseos.js'; // New
import { defineReseniaVendedor } from './ReseniaVendedor.js'; // New

// Definir todos los modelos
const models = {
    Categoria: defineCategoria(sequelize, DataTypes),
    Provincia: defineProvincia(sequelize, DataTypes),
    Ciudad: defineCiudad(sequelize, DataTypes),
    Usuario: defineUsuario(sequelize, DataTypes),
    Vendedor: defineVendedor(sequelize, DataTypes),
    Direccion: defineDireccion(sequelize, DataTypes),
    Producto: defineProducto(sequelize, DataTypes),
    ProductoVariante: defineProductoVariante(sequelize, DataTypes),
    ProductoTag: defineProductoTag(sequelize, DataTypes),
    Resenia: defineResenia(sequelize, DataTypes),
    Carrito: defineCarrito(sequelize, DataTypes),
    CarritoItem: defineCarritoItem(sequelize, DataTypes),
    Orden: defineOrden(sequelize, DataTypes),
    OrdenItem: defineOrdenItem(sequelize, DataTypes),
    Deseos: defineDeseos(sequelize, DataTypes),
    ReseniaVendedor: defineReseniaVendedor(sequelize, DataTypes),
};

// Asociaciones
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

export const {
    Categoria, Provincia, Ciudad, Usuario, Vendedor,
    Direccion, Producto, ProductoVariante, ProductoTag, 
    Resenia, Carrito, CarritoItem, Orden, OrdenItem,
    Deseos, ReseniaVendedor
} = models;

export default models;