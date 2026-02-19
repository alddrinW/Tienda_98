import { sequelize } from '../data/config/db.js';
import { Orden, OrdenItem, Producto, ProductoVariante, Usuario } from '../data/models/index.js';

export const createOrden = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { 
            userInfo, // { nombre, email, telefono }
            shippingInfo, // { direccion, ciudad, referencia }
            cartItems, // [{ productId, variantId, quantity, price }]
            paymentMethod,
            total,
            shippingCost
        } = req.body;

        // 1. Generate Order Code (Simple alphanumeric)
        const codigo_orden = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        // 2. Prepare Data JSONs
        const datos_contacto_json = userInfo;
        const datos_envio_json = shippingInfo;
        
        // 3. Create Order Record
        const nuevaOrden = await Orden.create({
            codigo_orden,
            idUsuario: req.idUsuario || null, // From Optional Auth Middleware
            datos_contacto_json,
            datos_envio_json,
            metodo_pago: paymentMethod,
            subtotal: total - (shippingCost || 0),
            costo_envio: shippingCost || 0,
            total: total,
            estado: 'pendiente'
        }, { transaction: t });

        // 4. Create Order Items & Update Stock
        for (const item of cartItems) {
            // Fetch Product to get names and verify stock (Concurrency check skipped for simplicity)
             const producto = await Producto.findByPk(item.productId);
             if (!producto) throw new Error(`Product ${item.productId} not found`);

             // Check Variant if exists
             let variantName = null;
             if (item.variantId) {
                 const variante = await ProductoVariante.findByPk(item.variantId);
                 if (variante) {
                     variantName = variante.nombre;
                 }
             }

            await OrdenItem.create({
                idOrden: nuevaOrden.idOrden,
                idProducto: item.productId,
                idVariante: item.variantId || null,
                nombre_producto: producto.nombre,
                nombre_variante: variantName,
                cantidad: item.quantity,
                precio_unitario: item.price,
                total_linea: item.price * item.quantity
            }, { transaction: t });

            // TODO: Decrement Stock Logic (Optional for now, user didn't explicitly ask for strict stock management yet)
        }

        await t.commit();

        res.status(201).json({
            message: 'Order created successfully',
            orderId: nuevaOrden.codigo_orden,
            id: nuevaOrden.idOrden
        });

    } catch (error) {
        await t.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const orden = await Orden.findByPk(id, {
            include: [{ model: OrdenItem }]
        });

        if (!orden) return res.status(404).json({ message: 'Order not found' });

        res.json(orden);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const trackOrder = async (req, res) => {
    try {
        const { codigo } = req.params;
        const orden = await Orden.findOne({
            where: { codigo_orden: codigo },
            include: [{
                model: OrdenItem,
                include: [{ model: Producto, attributes: ['nombre', 'imagen_principal'] }]
            }]
        });

        if (!orden) return res.status(404).json({ message: 'Pedido no encontrado' });

        res.json(orden);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al rastrear pedido' });
    }
};
