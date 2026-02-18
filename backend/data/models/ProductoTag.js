export const defineProductoTag = (sequelize, DataTypes) => {
    const ProductoTag = sequelize.define('producto_tag', {
        idTag: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tag: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        tableName: 'producto_tag',
        timestamps: false
    });

    ProductoTag.associate = (models) => {
        ProductoTag.belongsTo(models.Producto, { foreignKey: 'idProducto' });
    };

    return ProductoTag;
};
