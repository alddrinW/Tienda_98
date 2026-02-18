export const defineDireccion = (sequelize, DataTypes) => {
    const Direccion = sequelize.define('direccion', {
        idDireccion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        calle_principal: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        calle_secundaria: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        codigo_postal: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        referencia: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        latitud: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },
        longitud: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },
        idCiudad: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'direccion',
        timestamps: false,
        indexes: [{ fields: ['idCiudad'] }],
    });

    Direccion.associate = (models) => {
        Direccion.belongsTo(models.Ciudad, { foreignKey: 'idCiudad' });
    };

    return Direccion;
};