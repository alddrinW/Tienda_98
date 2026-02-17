export const defineCategoria = (sequelize, DataTypes) => {
    const Categoria = sequelize.define('categoria', {
        idCategoria: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        idSubCategoria: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'categoria',
        timestamps: false,
        indexes: [{ fields: ['idSubCategoria'] }],
    });

    Categoria.associate = (models) => {
        Categoria.hasMany(models.Categoria, {
            as: 'Subcategorias',
            foreignKey: 'idSubCategoria'
        });
        Categoria.belongsTo(models.Categoria, {
            as: 'Padre',
            foreignKey: 'idSubCategoria'
        });
        Categoria.hasMany(models.Tienda, { foreignKey: 'idCategoria' });
        Categoria.hasMany(models.Producto, { foreignKey: 'idCategoria' });
    };

    return Categoria;
};