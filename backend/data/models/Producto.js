export const defineProducto = (sequelize, DataTypes) => {
    const Producto = sequelize.define('producto', {
        idProducto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idVendedor: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idCategoria: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false,
        },
        sku: {
            type: DataTypes.STRING(100),
        },
        marca: {
            type: DataTypes.STRING(100),
        },
        precio: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        precio_oferta: {
            type: DataTypes.DECIMAL(12, 2),
        },
        precio_costo: {
            type: DataTypes.DECIMAL(12, 2),
        },
        descripcion_corta: {
            type: DataTypes.TEXT,
        },
        descripcion_larga: {
            type: DataTypes.TEXT,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        alerta_stock_bajo: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
        },
        peso_kg: {
            type: DataTypes.DECIMAL(8, 2),
        },
        dimensiones_json: {
            type: DataTypes.JSON, // { largo, ancho, alto }
        },
        tipo_entrega: {
            type: DataTypes.ENUM('inmediata', 'pedido'),
            defaultValue: 'inmediata',
        },
        estado: {
            type: DataTypes.ENUM('borrador', 'publicado', 'suspendido'),
            defaultValue: 'borrador',
        },
        destacado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        imagen_principal: {
            type: DataTypes.STRING(255),
        },
        imagenes_json: {
            type: DataTypes.JSON, // Array de URLs
        },
        meta_titulo: {
            type: DataTypes.STRING(100),
        },
        meta_descripcion: {
            type: DataTypes.STRING(200),
        },
        calificacion_promedio: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 0.00,
        },
        cantidad_resenias: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        suma_calificaciones: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        fecha_actualizacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'producto',
        timestamps: false,
    });

    Producto.associate = (models) => {
        Producto.belongsTo(models.Vendedor, { foreignKey: 'idVendedor' });
        Producto.belongsTo(models.Categoria, { foreignKey: 'idCategoria' });
        Producto.hasMany(models.ProductoVariante, { foreignKey: 'idProducto', onDelete: 'CASCADE' });
        Producto.hasMany(models.ProductoTag, { foreignKey: 'idProducto', onDelete: 'CASCADE' });
        Producto.hasMany(models.Resenia, { foreignKey: 'idProducto', onDelete: 'CASCADE' });
    };

    return Producto;
};