export const defineVendedor = (sequelize, DataTypes) => {
    const Vendedor = sequelize.define('vendedor', {
        idVendedor: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nombre_tienda: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        slug_tienda: {
            type: DataTypes.STRING(150),
            unique: true,
        },
        telefono_contacto: {
            type: DataTypes.STRING(20),
        },
        logo_url: {
            type: DataTypes.STRING(255),
        },
        banner_url: {
            type: DataTypes.STRING(255),
        },
        descripcion: {
            type: DataTypes.TEXT,
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
        aprobado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'vendedor',
        timestamps: false,
    });

    Vendedor.associate = (models) => {
        Vendedor.belongsTo(models.Usuario, { foreignKey: 'idUsuario' });
        Vendedor.hasMany(models.Producto, { foreignKey: 'idVendedor', onDelete: 'CASCADE' });
    };

    return Vendedor;
};