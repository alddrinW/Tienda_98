import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Storage Configuration
// Using local storage for simplicity, but easily swappable for Cloudinary later.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this folder exists or create it
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        // Unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Filter Configuration (Images Only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

// 3. Size Limits (e.g., 5MB)
const limits = {
    fileSize: 5 * 1024 * 1024
};

export const upload = multer({ 
    storage, 
    fileFilter, 
    limits 
});
