export const defineReseniaVendedor = (sequelize, DataTypes) => {
    const ReseniaVendedor = sequelize.define('resenias_vendedor', {
        idReseniaVendedor: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idVendedor: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        calificacion: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        comentario: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        verificada_compra: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        fecha: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'resenias_vendedor',
        timestamps: false,
        indexes: [
            { unique: true, fields: ['idUsuario', 'idVendedor'] }
        ],
    });

    ReseniaVendedor.associate = (models) => {
        ReseniaVendedor.belongsTo(models.Vendedor, {
            foreignKey: 'idVendedor',
            onDelete: 'CASCADE'
        });
        ReseniaVendedor.belongsTo(models.Usuario, {
            foreignKey: 'idUsuario',
            onDelete: 'CASCADE'
        });
    };

    return ReseniaVendedor;
};