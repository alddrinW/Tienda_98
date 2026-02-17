import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.es_admin) {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
    }
};
