import { Provincia, Ciudad } from '../data/models/index.js';

export const getProvincias = async (req, res) => {
    try {
        const provincias = await Provincia.findAll({
            order: [['nombre', 'ASC']]
        });
        res.json(provincias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obtaining provinces' });
    }
};

export const getCiudadesByProvincia = async (req, res) => {
    try {
        const { idProvincia } = req.params;
        const ciudades = await Ciudad.findAll({
            where: { idProvincia },
            order: [['nombre', 'ASC']]
        });
        res.json(ciudades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obtaining cities' });
    }
};
