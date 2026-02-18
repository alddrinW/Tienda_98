export const defineOrden = (sequelize, DataTypes) => {
    const Orden = sequelize.define('orden', {
        idOrden: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        codigo_orden: {
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: false
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: true // Nullable for guest checkout
        },
        datos_contacto_json: {
            type: DataTypes.JSON,
            allowNull: false
        },
        datos_envio_json: {
            type: DataTypes.JSON,
            allowNull: false
        },
        datos_facturacion_json: {
            type: DataTypes.JSON,
            allowNull: true
        },
        metodo_pago: {
            type: DataTypes.STRING(50)
        },
        estado_pago: {
            type: DataTypes.ENUM('pendiente', 'pagado', 'reembolsado'),
            defaultValue: 'pendiente'
        },
        subtotal: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        descuento: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0.00
        },
        costo_envio: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0.00
        },
        total: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        tipo_envio: {
            type: DataTypes.STRING(100)
        },
        estado: {
            type: DataTypes.ENUM('pendiente', 'procesando', 'en_espera', 'enviado', 'completado', 'cancelado'),
            defaultValue: 'pendiente'
        },
        mensaje_whatsapp_generado: {
            type: DataTypes.TEXT
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        fecha_actualizacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'orden',
        timestamps: false
    });

    Orden.associate = (models) => {
        Orden.belongsTo(models.Usuario, { foreignKey: 'idUsuario' });
        Orden.hasMany(models.OrdenItem, { foreignKey: 'idOrden', onDelete: 'CASCADE' });
    };

    return Orden;
};
