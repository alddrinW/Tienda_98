import { sequelize } from '../data/config/db.js';
import { Carrito, CarritoItem, Producto, ProductoVariante } from '../data/models/index.js';

export const getCarrito = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        let carrito = await Carrito.findOne({
            where: { idUsuario, estado: 'activo' },
            include: [{
                model: CarritoItem,
                include: [
                    { model: Producto, attributes: ['idProducto', 'nombre', 'precio', 'imagen_principal', 'slug'] }
                ]
            }]
        });

        if (!carrito) {
            return res.json({ items: [] });
        }

        res.json(carrito);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el carrito' });
    }
};

export const addItem = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const idUsuario = req.idUsuario;
        const { idProducto, cantidad, idVariante } = req.body;

        // 1. Get or Create Cart
        const [carrito] = await Carrito.findOrCreate({
            where: { idUsuario, estado: 'activo' },
            defaults: { idUsuario, estado: 'activo' },
            transaction: t
        });

        // 2. Check Product Price
        const producto = await Producto.findByPk(idProducto);
        if (!producto) {
            await t.rollback();
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // 3. Check if Item exists in Cart
        const existingItem = await CarritoItem.findOne({
            where: { 
                idCarrito: carrito.idCarrito, 
                idProducto,
                // idVariante: idVariante || null // Need to handle variants if schema supports it
            },
            transaction: t
        });

        if (existingItem) {
            existingItem.cantidad += cantidad || 1;
            existingItem.ultima_actualizacion = new Date();
            await existingItem.save({ transaction: t });
        } else {
            await CarritoItem.create({
                idCarrito: carrito.idCarrito,
                idProducto,
                cantidad: cantidad || 1,
                precio_unitario: producto.precio,
                // idVariante
            }, { transaction: t });
        }

        await t.commit();
        
        // Return updated cart
        // For simplicity, just return success message, frontend can refetch or we return item
        res.status(200).json({ message: 'Producto agregado al carrito' });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error al agregar al carrito' });
    }
};

export const removeItem = async (req, res) => {
    try {
        const { id } = req.params; // idCarritoItem
        const idUsuario = req.idUsuario;

        // Verify ownership indirectly via Cart
        const item = await CarritoItem.findByPk(id, {
            include: [{ model: Carrito }]
        });

        if (!item || item.carrito.idUsuario !== idUsuario) {
             return res.status(404).json({ message: 'Item no encontrado' });
        }

        await item.destroy();
        res.json({ message: 'Item eliminado del carrito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar del carrito' });
    }
};

export const clearCarrito = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        const carrito = await Carrito.findOne({ where: { idUsuario, estado: 'activo' } });

        if (carrito) {
            await CarritoItem.destroy({ where: { idCarrito: carrito.idCarrito } });
        }

        res.json({ message: 'Carrito vaciado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al vaciar el carrito' });
    }
};
