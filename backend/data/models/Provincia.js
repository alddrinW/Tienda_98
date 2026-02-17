export const defineProvincia = (sequelize, DataTypes) => {
    const Provincia = sequelize.define('provincia', {
        idProvincia: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'provincia',
        timestamps: false,
    });

    Provincia.associate = (models) => {
        Provincia.hasMany(models.Ciudad, {
            foreignKey: 'idProvincia',
            onDelete: 'RESTRICT'
        });
    };

    return Provincia;
};