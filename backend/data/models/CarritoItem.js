export const defineCarritoItem = (sequelize, DataTypes) => {
    const CarritoItem = sequelize.define('carrito_item', {
        idCarritoItem: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idCarrito: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cantidad: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
            validate: { min: 1 },
        },
        precio_unitario: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        precio_oferta_aplicado: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
        },
        fecha_agregado: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        ultima_actualizacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'carrito_item',
        timestamps: false,
        indexes: [
            { unique: true, fields: ['idCarrito', 'idProducto'] },
            { fields: ['idCarrito'] },
            { fields: ['idProducto'] }
        ],
    });

    CarritoItem.associate = (models) => {
        CarritoItem.belongsTo(models.Carrito, {
            foreignKey: 'idCarrito',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        CarritoItem.belongsTo(models.Producto, {
            foreignKey: 'idProducto',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return CarritoItem;
};