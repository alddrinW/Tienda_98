import { sequelize } from '../data/config/db.js';
import { Usuario, Direccion, Orden, OrdenItem, Producto, Vendedor } from '../data/models/index.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
    try {
        const user = await Usuario.findByPk(req.idUsuario, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { nombre, apellido, telefono, ruc_cedula, razon_social } = req.body;
        const user = await Usuario.findByPk(req.idUsuario);

        user.nombre = nombre || user.nombre;
        user.apellido = apellido || user.apellido;
        user.telefono = telefono || user.telefono;
        user.ruc_cedula = ruc_cedula || user.ruc_cedula;
        user.razon_social = razon_social || user.razon_social;

        await user.save();
        res.json({ message: 'Perfil actualizado', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await Usuario.findByPk(req.idUsuario);

        if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
            return res.status(400).json({ message: 'Contraseña actual incorrecta' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Contraseña actualizada' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Addresses
export const getDirecciones = async (req, res) => {
    try {
        // Direccion doesn't define 'idUsuario' explicitly in existing schema??
        // Wait, schema check: Direccion has NO idUsuario in the initial Audit.
        // It seems Direccion was designed to be linked to Tienda/Vendedor only?
        // Ah, typically Users have addresses too.
        // In this schema design, if Direccion table doesn't have idUsuario, we can't link it directly easily.
        // Option 1: Add idUsuario to Direccion (Best)
        // Option 2: Many-to-Many UserAddresses?
        // Let's assume Option 1 and PATCH the model if needed, OR checking if I missed it.
        // Looking at Direccion.js content from earlier... it only has idCiudad.
        // It DOES NOT have idUsuario.
        // I need to add idUsuario to Direccion model to support User Addresses.
        
        // TEMPORARY FIX: I will skip getDirecciones implementation until I add the field, OR I assume I should add it now.
        // The implementation plan says "Add Direccion" but didn't explicitly say "Modify Direccion Model to add idUsuario".
        // Use implicit add?
        
        // For now, let's assume I will add idUsuario to Direccion model in next step or now.
        // I'll write the code assuming it exists.

        const direcciones = await Direccion.findAll({
            where: { idUsuario: req.idUsuario }
        });
        res.json(direcciones);
    } catch (error) {
        // If column doesn't exist, this will error. I'll fix model in next step.
        console.error(error); 
        res.status(500).json({ message: 'Error retrieving addresses' });
    }
};

// ... addDireccion, updateDireccion ... (Will Implement assuming field exists)

export const getMyOrders = async (req, res) => {
    try {
        const ordenes = await Orden.findAll({
            where: { idUsuario: req.idUsuario },
            include: [{ 
                model: OrdenItem,
                include: [{ model: Producto, attributes: ['nombre', 'imagen_principal'] }]
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(ordenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error obtaining orders' });
    }
};

export const upgradeToSeller = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nombre_tienda, telefono, direccion } = req.body;
        const user = await Usuario.findByPk(req.idUsuario);

        if (user.rol === 'vendedor') {
            await t.rollback();
            return res.status(400).json({ message: 'Ya eres vendedor' });
        }

        // Create Address
        // Note: Direccion needs idUsuario if we want to query it later, or it's linked to Vendedor via idDireccion
        // Vendedor has idUsuario and idDireccion (FK).
        
        const nuevaDireccion = await Direccion.create(direccion, { transaction: t });

        await Vendedor.create({
            idUsuario: user.idUsuario,
            nombre_tienda,
            slug_tienda: nombre_tienda.toLowerCase().replace(/ /g, '-'),
            telefono,
            idDireccion: nuevaDireccion.idDireccion
        }, { transaction: t });

        user.rol = 'vendedor';
        await user.save({ transaction: t });

        await t.commit();
        res.json({ message: '¡Felicidades! Ahora eres vendedor', token: 'Please re-login to update claims' });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error upgrading to seller' });
    }
};
