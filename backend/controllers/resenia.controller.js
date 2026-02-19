import { sequelize } from '../data/config/db.js';
import { Resenia, ReseniaVendedor, Producto, Usuario, Vendedor } from '../data/models/index.js';

// Product Reviews
export const getReseniasByProducto = async (req, res) => {
    try {
        const { id } = req.params; // Product ID
        const resenias = await Resenia.findAll({
            where: { idProducto: id },
            include: [{ model: Usuario, attributes: ['nombre', 'apellido', 'foto_perfil'] }],
            order: [['fecha', 'DESC']]
        });
        res.json(resenias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener reseñas del producto' });
    }
};

export const createResenia = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params; // Product ID
        const { calificacion, titulo, comentario } = req.body;
        const idUsuario = req.idUsuario;

        // Check if user already reviewed this product
        const existingReview = await Resenia.findOne({
            where: { idProducto: id, idUsuario }
        });

        if (existingReview) {
            await t.rollback();
            return res.status(400).json({ message: 'Ya has calificado este producto' });
        }

        // TODO: Check verified purchase logic if needed (requires querying Orders)

        const nuevaResenia = await Resenia.create({
            idProducto: id,
            idUsuario,
            calificacion,
            titulo,
            comentario,
            fecha: new Date()
        }, { transaction: t });

        // Update Product Average Rating
        const ratings = await Resenia.findAll({
            where: { idProducto: id },
            attributes: ['calificacion'],
            transaction: t
        });

        const total = ratings.reduce((acc, r) => acc + r.calificacion, 0);
        const avg = total / ratings.length;

        await Producto.update({
            calificacion_promedio: avg,
            cantidad_resenias: ratings.length,
            suma_calificaciones: total
        }, { where: { idProducto: id }, transaction: t });

        await t.commit();
        res.status(201).json(nuevaResenia);

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al crear la reseña' });
    }
};

// Vendor Reviews
export const getReseniasByVendedor = async (req, res) => {
    try {
        const { id } = req.params; // Vendor ID
        const resenias = await ReseniaVendedor.findAll({
            where: { idVendedor: id },
            include: [{ model: Usuario, attributes: ['nombre', 'apellido', 'foto_perfil'] }],
            order: [['fecha', 'DESC']]
        });
        res.json(resenias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener reseñas del vendedor' });
    }
};

export const createReseniaVendedor = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params; // Vendor ID
        const { calificacion, comentario } = req.body;
        const idUsuario = req.idUsuario;

        const existingReview = await ReseniaVendedor.findOne({
            where: { idVendedor: id, idUsuario }
        });

        if (existingReview) {
            await t.rollback();
            return res.status(400).json({ message: 'Ya has calificado a este vendedor' });
        }

        const nuevaResenia = await ReseniaVendedor.create({
            idVendedor: id,
            idUsuario,
            calificacion,
            comentario,
            fecha: new Date()
        }, { transaction: t });

        // Update Vendor Average Rating
        const ratings = await ReseniaVendedor.findAll({
            where: { idVendedor: id },
            attributes: ['calificacion'],
            transaction: t
        });

        const total = ratings.reduce((acc, r) => acc + r.calificacion, 0);
        const avg = total / ratings.length;

        await Vendedor.update({
            calificacion_promedio: avg,
            cantidad_resenias: ratings.length
        }, { where: { idVendedor: id }, transaction: t });

        await t.commit();
        res.status(201).json(nuevaResenia);

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al crear la reseña del vendedor' });
    }
};
