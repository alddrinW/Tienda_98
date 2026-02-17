export const defineCarrito = (sequelize, DataTypes) => {
    const Carrito = sequelize.define('carrito', {
        idCarrito: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        fecha_ultima_modificacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        estado: {
            type: DataTypes.ENUM('activo', 'abandonado', 'convertido_en_pedido'),
            defaultValue: 'activo',
        },
    }, {
        tableName: 'carrito',
        timestamps: false,
        indexes: [
            { fields: ['idUsuario'] }
        ],
    });

    Carrito.associate = (models) => {
        Carrito.belongsTo(models.Usuario, {
            foreignKey: 'idUsuario',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        Carrito.hasMany(models.CarritoItem, {
            foreignKey: 'idCarrito',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Carrito;
};