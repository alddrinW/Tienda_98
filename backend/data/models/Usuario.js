export const defineUsuario = (sequelize, DataTypes) => {
    const Usuario = sequelize.define('usuario', {
        idUsuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        apellido: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        fecha_registro: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        fecha_ultimo_acceso: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        esta_activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        rol: {
            type: DataTypes.ENUM('cliente', 'vendedor', 'admin'),
            defaultValue: 'cliente',
        },
        ruc_cedula: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        razon_social: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
    }, {
        tableName: 'usuario',
        timestamps: false,
    });

    Usuario.associate = (models) => {
        Usuario.hasOne(models.Vendedor, {
            foreignKey: 'idUsuario',
            onDelete: 'CASCADE'
        });
    };

    return Usuario;
};