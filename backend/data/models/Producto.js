export const defineProducto = (sequelize, DataTypes) => {
    const Producto = sequelize.define('producto', {
        idProducto: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idTienda: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        idVendedor: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        imagen_principal: { type: DataTypes.STRING(255), allowNull: false },
        imagenes: { type: DataTypes.JSON, allowNull: true },
        precio: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
        idCategoria: { type: DataTypes.INTEGER, allowNull: false },
        sku: { type: DataTypes.STRING(100), unique: true, allowNull: true },
        fecha_publicacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        fecha_actualizacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        calificacion_promedio: { type: DataTypes.DECIMAL(3, 2).UNSIGNED, defaultValue: 0.00 },
        cantidad_resenias: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
        suma_calificaciones: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
        stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        activo: { type: DataTypes.BOOLEAN, defaultValue: false },
        precio_oferta: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
        caracteristicas_json: { type: DataTypes.JSON, allowNull: false },
        especificaciones_json: { type: DataTypes.JSON, allowNull: false },
    }, {
        tableName: 'producto',
        timestamps: false,
    });

    Producto.associate = (models) => {
        Producto.belongsTo(models.Vendedor, { foreignKey: 'idVendedor' });
        Producto.belongsTo(models.Tienda, { foreignKey: 'idTienda' });
        Producto.belongsTo(models.Categoria, { foreignKey: 'idCategoria' });
    };

    return Producto;
};