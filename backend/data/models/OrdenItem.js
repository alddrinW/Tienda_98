export const defineOrdenItem = (sequelize, DataTypes) => {
    const OrdenItem = sequelize.define('orden_item', {
        idOrdenItem: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idOrden: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idVariante: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        nombre_producto: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        nombre_variante: {
            type: DataTypes.STRING(100)
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        precio_unitario: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        total_linea: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        }
    }, {
        tableName: 'orden_item',
        timestamps: false
    });

    OrdenItem.associate = (models) => {
        OrdenItem.belongsTo(models.Orden, { foreignKey: 'idOrden' });
        OrdenItem.belongsTo(models.Producto, { foreignKey: 'idProducto' });
        OrdenItem.belongsTo(models.ProductoVariante, { foreignKey: 'idVariante' });
    };

    return OrdenItem;
};
