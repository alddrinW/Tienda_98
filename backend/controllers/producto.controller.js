import { sequelize } from '../data/config/db.js';
import { Producto, ProductoVariante, ProductoTag, Categoria, Vendedor } from '../data/models/index.js';

export const getProductos = async (req, res) => {
    try {
        const { categoria, buscar, precio_min, precio_max, orden } = req.query;
        let where = { activo: true, estado: 'publicado' };

        // Filters would go here (simplified for now)
        if (categoria) {
            // Logic to find category ID by slug or ID
        }

        const productos = await Producto.findAll({
            where,
            include: [
                { model: Categoria, attributes: ['nombre', 'slug'] },
                { model: Vendedor, attributes: ['nombre_tienda', 'slug_tienda'] },
                { model: ProductoVariante, separate: true }, // Load variants separately for performance
            ],
            order: [['fecha_creacion', 'DESC']]
        });

        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
};

export const getProductoBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const producto = await Producto.findOne({
            where: { slug, activo: true },
            include: [
                { model: Categoria },
                { model: Vendedor },
                { model: ProductoVariante },
                { model: ProductoTag }
            ]
        });

        if (!producto) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving product' });
    }
};

// Seller Only
export const createProducto = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { variantes, tags, ...productoData } = req.body;
        
        // Ensure user is the vendor
        // req.idUsuario comes from token. We need to find the Vendedor ID associated.
        const vendedor = await Vendedor.findOne({ where: { idUsuario: req.idUsuario } });
        if (!vendedor) {
            await t.rollback();
            return res.status(403).json({ message: 'User is not a registered vendor' });
        }

        productoData.idVendedor = vendedor.idVendedor;
        
        // Auto-generate slug if not provided
        if (!productoData.slug) {
            productoData.slug = productoData.nombre.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
        }

        const producto = await Producto.create(productoData, { transaction: t });

        // Add Variants
        if (variantes && variantes.length > 0) {
            const variantesData = variantes.map(v => ({ ...v, idProducto: producto.idProducto }));
            await ProductoVariante.bulkCreate(variantesData, { transaction: t });
        }

        // Add Tags
        if (tags && tags.length > 0) {
            const tagsData = tags.map(tag => ({ tag, idProducto: producto.idProducto }));
            await ProductoTag.bulkCreate(tagsData, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ message: 'Product created successfully', id: producto.idProducto });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};
