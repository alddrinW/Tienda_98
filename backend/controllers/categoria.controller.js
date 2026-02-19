import { Categoria } from '../data/models/index.js';

export const getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll({
            attributes: ['idCategoria', 'nombre', 'slug', 'icono_url'],
            include: [{ 
                model: Categoria, 
                as: 'Subcategorias', 
                required: false
            }]
        });
        res.json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving categories' });
    }
};

export const createCategoria = async (req, res) => {
    try {
        const { nombre, slug, icono_url, idPadre } = req.body;
        
        let categoriaSlug = slug;
        if (!categoriaSlug) {
            categoriaSlug = nombre.toLowerCase().replace(/ /g, '-');
        }

        const nuevaCategoria = await Categoria.create({
            nombre,
            slug: categoriaSlug,
            icono_url,
            idPadre
        });

        res.status(201).json(nuevaCategoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating category' });
    }
};
