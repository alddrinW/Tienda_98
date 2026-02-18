export const defineProductoVariante = (sequelize, DataTypes) => {
    const ProductoVariante = sequelize.define('producto_variante', {
        idVariante: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false // Ej: "Rojo - L"
        },
        sku: {
            type: DataTypes.STRING(100)
        },
        precio: {
            type: DataTypes.DECIMAL(12, 2)
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        imagen_url: {
            type: DataTypes.STRING(255)
        }
    }, {
        tableName: 'producto_variante',
        timestamps: false
    });

    ProductoVariante.associate = (models) => {
        ProductoVariante.belongsTo(models.Producto, { foreignKey: 'idProducto' });
    };

    return ProductoVariante;
};
