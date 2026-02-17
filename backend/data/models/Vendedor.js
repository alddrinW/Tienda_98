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
            unique: true,
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
    }, {
        tableName: 'vendedor',
        timestamps: false,
        indexes: [{ fields: ['idUsuario'] }],
    });

    Vendedor.associate = (models) => {
        Vendedor.belongsTo(models.Usuario, { foreignKey: 'idUsuario' });
        Vendedor.hasMany(models.Tienda, { foreignKey: 'idVendedor', onDelete: 'CASCADE' });
        Vendedor.hasMany(models.Producto, { foreignKey: 'idVendedor', onDelete: 'RESTRICT' });
    };

    return Vendedor;
};