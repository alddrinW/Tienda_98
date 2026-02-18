import { Usuario, Vendedor } from '../data/models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id, rol) => {
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const register = async (req, res) => {
    try {
        const { nombre, apellido, email, password, telefono, rol, ruc_cedula, razon_social, nombre_tienda } = req.body;

        const userExists = await Usuario.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Transaction logic would be better here if creating Vendedor too
        const newUser = await Usuario.create({
            nombre,
            apellido,
            email,
            password_hash,
            telefono,
            rol: rol || 'cliente',
            ruc_cedula,
            razon_social
        });

        // If rol is Vendedor, create Profile
        if (newUser.rol === 'vendedor' && nombre_tienda) {
            await Vendedor.create({
                idUsuario: newUser.idUsuario,
                nombre_tienda: nombre_tienda,
                slug_tienda: nombre_tienda.toLowerCase().replace(/ /g, '-')
            });
        }

        if (newUser) {
            res.status(201).json({
                idUsuario: newUser.idUsuario,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol,
                token: generateToken(newUser.idUsuario, newUser.rol),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Usuario.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            // Update last access
            user.fecha_ultimo_acceso = new Date();
            await user.save();

            res.json({
                idUsuario: user.idUsuario,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                token: generateToken(user.idUsuario, user.rol),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await Usuario.findByPk(req.idUsuario, {
            attributes: { exclude: ['password_hash'] }
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
