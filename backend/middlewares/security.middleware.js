import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// 1. CORS Configuration
// Allow requests from frontend domain only in production
const whitelist = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000'];

export const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Allow cookies/headers
};

// 2. Rate Limiting
// Limit repeated requests to public APIs (Use stricter limits for Login/Register routes)
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login attempts per hour
    message: "Too many login attempts, please try again later"
});

// 3. Helmet is usually applied directly as app.use(helmet()) in server.js
// but we export it here for consistency if needed.
export { helmet, cors };
