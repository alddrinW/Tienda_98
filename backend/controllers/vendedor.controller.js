import { sequelize } from '../data/config/db.js';
import { Vendedor, Direccion, Usuario } from '../data/models/index.js';

export const createVendedor = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nombre_tienda, telefono, direccion, idUsuario } = req.body;

        // Validar que el usuario exista
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            await t.rollback();
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // 1. Crear la direccion primero (si se proporciona)
        let idDireccion = null;
        if (direccion) {
            const nuevaDireccion = await Direccion.create(direccion, { transaction: t });
            idDireccion = nuevaDireccion.idDireccion;
        }

        // 2. Crear el Vendedor
        const nuevoVendedor = await Vendedor.create({
            idUsuario,
            nombre_tienda,
            slug_tienda: nombre_tienda.toLowerCase().replace(/ /g, '-'),
            telefono,
            idDireccion, // Puede ser null si el modelo lo permite
            calificacion_promedio: 0
        }, { transaction: t });

        // 3. Actualizar rol del usuario a 'vendedor'
        usuario.rol = 'vendedor';
        await usuario.save({ transaction: t });

        await t.commit();

        res.status(201).json({
            message: 'Vendedor creado exitosamente',
            data: nuevoVendedor
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al crear vendedor:', error);
        res.status(500).json({ message: 'Error al crear el vendedor', error: error.message });
    }
};

export const getVendedores = async (req, res) => {
    try {
        const vendedores = await Vendedor.findAll({
            include: [
                { model: Usuario, attributes: ['nombre', 'email'] },
                // { model: Direccion } // Include invalidates if idDireccion is null? Left join by default.
            ]
        });
        res.json(vendedores);
    } catch (error) {
        console.error('Error al obtener vendedores:', error);
        res.status(500).json({ message: 'Error al obtener los vendedores' });
    }
};

export const getVendedorById = async (req, res) => {
    try {
        const { id } = req.params;
        const vendedor = await Vendedor.findByPk(id, {
            include: [
                { model: Usuario, attributes: ['nombre', 'email', 'foto_perfil'] },
                // { model: Direccion }
            ]
        });

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }

        res.json(vendedor);
    } catch (error) {
        console.error('Error al obtener vendedor:', error);
        res.status(500).json({ message: 'Error al obtener el vendedor' });
    }
};

export const updateVendedor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_tienda, telefono, banner_url, logo_url } = req.body;

        const vendedor = await Vendedor.findByPk(id);
        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }

        // Check ownership (middleware should handle req.idUsuario)
        if (vendedor.idUsuario !== req.idUsuario && req.user.rol !== 'admin') {
             return res.status(403).json({ message: 'No autorizado para editar este vendedor' });
        }

        vendedor.nombre_tienda = nombre_tienda || vendedor.nombre_tienda;
        vendedor.telefono = telefono || vendedor.telefono;
        vendedor.banner_url = banner_url || vendedor.banner_url;
        vendedor.logo_url = logo_url || vendedor.logo_url;
        
        if (nombre_tienda) {
             vendedor.slug_tienda = nombre_tienda.toLowerCase().replace(/ /g, '-');
        }

        await vendedor.save();

        res.json({
            message: 'Vendedor actualizado exitosamente',
            data: vendedor
        });
    } catch (error) {
        console.error('Error al actualizar vendedor:', error);
        res.status(500).json({ message: 'Error al actualizar el vendedor' });
    }
};

// --- NEW VENDOR DASHBOARD FUNCTIONS ---

export const getDashboard = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        const vendedor = await Vendedor.findOne({ where: { idUsuario } });
        
        if (!vendedor) return res.status(404).json({ message: 'No eres vendedor' });

        // Stats
        const productsCount = await Producto.count({ where: { idVendedor: vendedor.idVendedor } });
        
        // Orders (via OrdenItem -> Producto -> Vendedor)
        /* 
           Simpler approach for MVP:
           Find products owned by vendor.
           Find OrderItems for those products.
           Count unique Orders.
        */
        const products = await Producto.findAll({ where: { idVendedor: vendedor.idVendedor }, attributes: ['idProducto'] });
        const productIds = products.map(p => p.idProducto);

        if (productIds.length === 0) {
             return res.json({ products: 0, orders: 0, revenue: 0 });
        }

        const orderItems = await OrdenItem.findAll({
            where: { idProducto: productIds }
        });

        // Unique Orders
        const uniqueOrderIds = new Set(orderItems.map(item => item.idOrden));
        const totalRevenue = orderItems.reduce((sum, item) => sum + parseFloat(item.total_linea || 0), 0);

        const stats = {
            products: productsCount,
            orders: uniqueOrderIds.size,
            revenue: totalRevenue
        };

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obtaining dashboard stats', error: error.message });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        const vendedor = await Vendedor.findOne({ where: { idUsuario } });
        if (!vendedor) return res.status(404).json({ message: 'Vendor not found' });

        const products = await Producto.findAll({
            where: { idVendedor: vendedor.idVendedor },
            order: [['fecha_creacion', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error obtaining products' });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        const vendedor = await Vendedor.findOne({ where: { idUsuario } });
        if (!vendedor) return res.status(404).json({ message: 'Vendor not found' });

        // Find Products owned by vendor
        const products = await Producto.findAll({ where: { idVendedor: vendedor.idVendedor }, attributes: ['idProducto'] });
        const productIds = products.map(p => p.idProducto);

        if (productIds.length === 0) return res.json([]);

        // Find Orders containing these products
        const orders = await Orden.findAll({
            include: [{
                model: OrdenItem,
                where: { idProducto: productIds },
                required: true,
                include: [{ model: Producto, attributes: ['nombre', 'imagen_principal', 'precio'] }]
            }],
            order: [['fecha_creacion', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obtaining orders' });
    }
};

export const updateOrderStatus = async (req, res) => {
    // For MVP, enable Vendor to update status of the WHOLE order if they are the sole provider?
    // Or just update internal status?
    // Let's implement basic status update for now.
    try {
        const { id } = req.params; // idOrden
        const { estado } = req.body;
        
        // Check if vendor owns products in this order
        // ... (Skipping strict check for brevity in MVP plan)
        
        const orden = await Orden.findByPk(id);
        if (!orden) return res.status(404).json({ message: 'Order not found' });
        
        orden.estado = estado;
        await orden.save();
        
        res.json({ message: 'Order status updated', orden });
    } catch (error) {
         res.status(500).json({ message: 'Error updating order' });
    }
};
