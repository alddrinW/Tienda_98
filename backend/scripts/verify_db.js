import { sequelize } from '../data/config/db.js';

console.log('Sequelize loaded:', !!sequelize);

try {
    await sequelize.authenticate();
    console.log('Connection OK');
} catch (e) {
    console.error('Connection failed:', e);
}
