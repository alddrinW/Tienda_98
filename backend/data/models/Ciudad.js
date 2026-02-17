export const defineCiudad = (sequelize, DataTypes) => {
    const Ciudad = sequelize.define('ciudad', {
        idCiudad: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        idProvincia: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'ciudad',
        timestamps: false,
        indexes: [{ fields: ['idProvincia'] }],
    });

    Ciudad.associate = (models) => {
        Ciudad.belongsTo(models.Provincia, { foreignKey: 'idProvincia' });
        Ciudad.hasMany(models.Direccion, { foreignKey: 'idCiudad' });
    };

    return Ciudad;
};