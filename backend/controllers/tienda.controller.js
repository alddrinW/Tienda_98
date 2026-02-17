import { sequelize } from '../data/config/db.js';
import { Tienda, Direccion, Categoria } from '../data/models/index.js';

export const createTienda = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nombre, idVendedor, telefono, idCategoria, direccion } = req.body;

        // 1. Crear la direccion primero
        const nuevaDireccion = await Direccion.create(direccion, { transaction: t });

        // 2. Crear la tienda vinculada a la direccion
        const nuevaTienda = await Tienda.create({
            nombre,
            idVendedor,
            telefono,
            idCategoria,
            idDireccion: nuevaDireccion.idDireccion
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            message: 'Tienda creada exitosamente',
            data: {
                ...nuevaTienda.toJSON(),
                direccion: nuevaDireccion
            }
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al crear tienda:', error);
        res.status(500).json({ message: 'Error al crear la tienda', error: error.message });
    }
};

export const getTiendas = async (req, res) => {
    try {
        const tiendas = await Tienda.findAll({
            include: [
                { model: Direccion },
                { model: Categoria }
            ]
        });
        res.json(tiendas);
    } catch (error) {
        console.error('Error al obtener tiendas:', error);
        res.status(500).json({ message: 'Error al obtener las tiendas' });
    }
};

export const getTiendaById = async (req, res) => {
    try {
        const { id } = req.params;
        const tienda = await Tienda.findByPk(id, {
            include: [
                { model: Direccion },
                { model: Categoria }
            ]
        });

        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        res.json(tienda);
    } catch (error) {
        console.error('Error al obtener tienda:', error);
        res.status(500).json({ message: 'Error al obtener la tienda' });
    }
};

export const updateTienda = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { direccion, ...tiendaData } = req.body;

        const tienda = await Tienda.findByPk(id);
        if (!tienda) {
            await t.rollback();
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        // Actualizar datos de la tienda
        await tienda.update(tiendaData, { transaction: t });

        // Si viene dirección, actualizamos
        if (direccion) {
            const direccionRecord = await Direccion.findByPk(tienda.idDireccion);
            if (direccionRecord) {
                await direccionRecord.update(direccion, { transaction: t });
            }
        }

        await t.commit();
        
        // Recargar para devolver datos actualizados
        const tiendaActualizada = await Tienda.findByPk(id, {
            include: [{ model: Direccion }]
        });

        res.json({
            message: 'Tienda actualizada exitosamente',
            data: tiendaActualizada
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al actualizar tienda:', error);
        res.status(500).json({ message: 'Error al actualizar la tienda' });
    }
};

export const deleteTienda = async (req, res) => {
    try {
        const { id } = req.params;
        const tienda = await Tienda.findByPk(id);

        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        await tienda.destroy();
        res.json({ message: 'Tienda eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tienda:', error);
        res.status(500).json({ message: 'Error al eliminar la tienda' });
    }
};

export const updateTiendaStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['pendiente', 'activo', 'inactivo'].includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido. Valores permitidos: pendiente, activo, inactivo' });
        }

        const tienda = await Tienda.findByPk(id);

        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        tienda.estado = estado;
        await tienda.save();

        res.json({ message: `Estado de la tienda actualizado a: ${estado}`, data: tienda });
    } catch (error) {
        console.error('Error al actualizar estado de la tienda:', error);
        res.status(500).json({ message: 'Error al actualizar el estado de la tienda' });
    }
};
