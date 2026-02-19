import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './data/config/db.js';
import colors from 'colors';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { corsOptions, cors, helmet, apiLimiter } from './middlewares/security.middleware.js';
import morgan from 'morgan';

// Load env vars
dotenv.config();

// Initialize App
const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));

// Logging (Dev only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Global Rate Limiting
app.use('/api', apiLimiter);

// Routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/producto.routes.js';
import locationRoutes from './routes/ubicacion.routes.js';
import orderRoutes from './routes/orden.routes.js';
import cartRoutes from './routes/carrito.routes.js';
import wishlistRoutes from './routes/deseos.routes.js';
import reviewRoutes from './routes/resenia.routes.js';
import userRoutes from './routes/usuario.routes.js';
import vendorRoutes from './routes/vendedor.routes.js';
import adminRoutes from './routes/admin.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('API Tienda 98 is running...');
});

// Error Handling (Must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Database Connection & Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully'.green.inverse);
        
        // Sync models (Careful with force: true in production!)
        // await sequelize.sync({ alter: true }); 

        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
        });
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

startServer();