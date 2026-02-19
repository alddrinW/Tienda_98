import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        // Bearer <token>
        const bearerForamt = token.split(' ')[1]; 
        const decoded = jwt.verify(bearerForamt, process.env.JWT_SECRET);
        req.idUsuario = decoded.id;
        req.rol = decoded.rol;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

export const verifyAdmin = (req, res, next) => {
    if (req.user && (req.user.rol === 'admin' || req.user.es_admin === true)) {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

export const verifyVendedor = (req, res, next) => {
    if (req.user && (req.user.rol === 'vendedor' || req.user.rol === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Vendor access required' });
    }
};

export const verifyTokenOptional = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        req.idUsuario = null; // Guest
        return next();
    }

    try {
        const bearerForamt = token.split(' ')[1];
        const decoded = jwt.verify(bearerForamt, process.env.JWT_SECRET);
        req.idUsuario = decoded.id;
        req.rol = decoded.rol;
    } catch (error) {
        // If token is invalid, we treat as guest or could error out.
        // For optional auth, usually we fall back to guest unless token is malformed?
        // Let's safe fail to Guest
        req.idUsuario = null;
    }
    next();
};

export const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.rol || !roles.includes(req.rol)) {
            return res.status(403).json({ message: `Require ${roles.join(' or ')} Role` });
        }
        next();
    };
};

export const isAdmin = verifyRole(['admin']);
export const isSeller = verifyRole(['vendedor', 'admin']);
export const isCustomer = verifyRole(['cliente', 'vendedor', 'admin']);
