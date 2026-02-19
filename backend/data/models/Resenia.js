export const defineResenia = (sequelize, DataTypes) => {
    const Resenia = sequelize.define('resenias', {
        idResenia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        nombre_invitado: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        email_invitado: { // Optional, for verification if needed later
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        calificacion: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        titulo: {
            type: DataTypes.STRING(150),
            allowNull: true,
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
        tableName: 'resenias',
        timestamps: false,
        indexes: [
            { unique: true, fields: ['idUsuario', 'idProducto'] }
        ],
    });

    Resenia.associate = (models) => {
        Resenia.belongsTo(models.Producto, {
            foreignKey: 'idProducto',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
        Resenia.belongsTo(models.Usuario, {
            foreignKey: 'idUsuario',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Resenia;
};