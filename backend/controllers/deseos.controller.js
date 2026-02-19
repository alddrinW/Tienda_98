import { Deseos, Producto } from '../data/models/index.js';

export const getDeseos = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        const deseos = await Deseos.findAll({
            where: { idUsuario },
            include: [{
                model: Producto,
                attributes: ['idProducto', 'nombre', 'precio', 'imagen_principal', 'slug']
            }],
            order: [['fecha_agregado', 'DESC']]
        });
        res.json(deseos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener lista de deseos' });
    }
};

export const addDeseo = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        const { idProducto } = req.body;

        const [deseo, created] = await Deseos.findOrCreate({
            where: { idUsuario, idProducto },
            defaults: { idUsuario, idProducto }
        });

        if (created) {
            res.status(201).json({ message: 'Producto agregado a deseos' });
        } else {
            res.status(200).json({ message: 'El producto ya está en deseos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar a deseos' });
    }
};

export const removeDeseo = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        const { idProducto } = req.params;

        const deleted = await Deseos.destroy({
            where: { idUsuario, idProducto }
        });

        if (deleted) {
            res.json({ message: 'Producto eliminado de deseos' });
        } else {
            res.status(404).json({ message: 'Producto no encontrado en deseos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar de deseos' });
    }
};

export const clearDeseos = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        await Deseos.destroy({ where: { idUsuario } });
        res.json({ message: 'Lista de deseos vaciada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al vaciar lista de deseos' });
    }
};
