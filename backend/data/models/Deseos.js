export const defineDeseos = (sequelize, DataTypes) => {
    const Deseos = sequelize.define('deseos', {
        idDeseo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fecha_agregado: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'deseos',
        timestamps: false,
        indexes: [
            { unique: true, fields: ['idUsuario', 'idProducto'] }  // opcional, pero recomendado
        ],
    });

    Deseos.associate = (models) => {
        Deseos.belongsTo(models.Usuario, {
            foreignKey: 'idUsuario',
            onDelete: 'CASCADE'
        });
        Deseos.belongsTo(models.Producto, {
            foreignKey: 'idProducto',
            onDelete: 'CASCADE'
        });
    };

    return Deseos;
};