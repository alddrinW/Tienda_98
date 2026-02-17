export const defineTienda = (sequelize, DataTypes) => {
    const Tienda = sequelize.define('tienda', {
        idTienda: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idVendedor: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        logo: { type: DataTypes.STRING(255), allowNull: true },
        estado: { type: DataTypes.ENUM('pendiente', 'activo', 'inactivo'), defaultValue: 'pendiente' },
        banner: { type: DataTypes.STRING(255), allowNull: true },
        calificacion_promedio: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00 },
        descripcion: { type: DataTypes.TEXT, allowNull: true },
        fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        idCategoria: { type: DataTypes.INTEGER, allowNull: true },
        telefono: { type: DataTypes.STRING(20), allowNull: false },
        idDireccion: { type: DataTypes.INTEGER, allowNull: false },
    }, {
        tableName: 'tienda',
        timestamps: false,
        indexes: [
            { fields: ['idVendedor'] },
            { fields: ['idCategoria'] }
        ],
    });

    Tienda.associate = (models) => {
        Tienda.belongsTo(models.Vendedor, { foreignKey: 'idVendedor' });
        Tienda.belongsTo(models.Categoria, { foreignKey: 'idCategoria' });
        Tienda.belongsTo(models.Direccion, { foreignKey: 'idDireccion' });
        Tienda.hasMany(models.Producto, { foreignKey: 'idTienda', onDelete: 'SET NULL' });
    };

    return Tienda;
};