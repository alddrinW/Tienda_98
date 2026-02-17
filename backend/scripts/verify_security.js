import { sequelize } from '../data/config/db.js';
import { Provincia, Ciudad, Usuario, Vendedor } from '../data/models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://127.0.0.1:3001/api/tiendas';
const SECRET = process.env.JWT_SECRET || 'secret_key';

// Generate simulated tokens
const userToken = jwt.sign({ idUsuario: 1, es_admin: false }, SECRET);
const adminToken = jwt.sign({ idUsuario: 2, es_admin: true }, SECRET);

console.log('User Token:', userToken);
console.log('Admin Token:', adminToken);

async function seedData() {
    console.log('--- Seeding Data ---');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await sequelize.sync({ force: true }); 
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

    const provincia = await Provincia.create({ nombre: 'Pichincha' });
    const ciudad = await Ciudad.create({ nombre: 'Quito', idProvincia: provincia.idProvincia });
    
    // User
    const usuario = await Usuario.create({
        nombre: 'Juan',
        apellido: 'Perez',
        email: 'juan@example.com',
        password_hash: 'hash_dummy',
        telefono: '0999999999',
        es_admin: false
    });

    // Admin
    await Usuario.create({
        nombre: 'Admin',
        apellido: 'Super',
        email: 'admin@example.com',
        password_hash: 'hash_dummy',
        es_admin: true
    });

    const vendedor = await Vendedor.create({
        idUsuario: usuario.idUsuario,
        aprobado: true
    });

    return { ciudad, vendedor };
}

async function testProtectedRoutes(ciudadId, vendedorId) {
    console.log('\n--- Testing Protected Routes (Create) ---');
    
    // 1. No Token
    let response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });
    console.log('No Token Status:', response.status); // Expected 401
    
    // 2. With Token (User)
    response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            nombre: 'Tienda Segura',
            idVendedor: vendedorId,
            telefono: '0988888888',
            direccion: {
                calle_principal: 'Calle Segura',
                idCiudad: ciudadId
            }
        })
    });
    const data = await response.json();
    console.log('With Token Status:', response.status); // Expected 201
    return data.data;
}

async function testAdminRoutes(tiendaId) {
    console.log('\n--- Testing Admin Routes (Update Status) ---');

    // 1. User Token (Forbidden)
    let response = await fetch(`${BASE_URL}/${tiendaId}/status`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ estado: 'activo' })
    });
    console.log('User Token Status:', response.status); // Expected 403

    // 2. Admin Token (Allowed)
    response = await fetch(`${BASE_URL}/${tiendaId}/status`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ estado: 'activo' })
    });
    const data = await response.json();
    console.log('Admin Token Status:', response.status); // Expected 200
    console.log('New Status:', data.data.estado);
}

async function run() {
    try {
        const { ciudad, vendedor } = await seedData();
        
        const nuevaTienda = await testProtectedRoutes(ciudad.idCiudad, vendedor.idVendedor);
        
        if (nuevaTienda && nuevaTienda.idTienda) {
            await testAdminRoutes(nuevaTienda.idTienda);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
