import { sequelize } from '../data/config/db.js';
import { Provincia, Ciudad, Usuario, Vendedor, Tienda } from '../data/models/index.js';

console.log('Provincia:', Provincia);
console.log('Ciudad:', Ciudad);
console.log('Vendedor:', Vendedor);

const BASE_URL = 'http://127.0.0.1:3001/api/tiendas';

async function seedData() {
    console.log('--- Seeding Data ---');
    
    // Clean up to avoid duplicates if running multiple times
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await sequelize.sync({ force: true }); // WARNING: This wipes the DB
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

    const provincia = await Provincia.create({ nombre: 'Pichincha' });
    const ciudad = await Ciudad.create({ nombre: 'Quito', idProvincia: provincia.idProvincia });
    
    const usuario = await Usuario.create({
        nombre: 'Juan',
        apellido: 'Perez',
        email: 'juan@example.com',
        password_hash: 'hash_dummy',
        telefono: '0999999999'
    });

    const vendedor = await Vendedor.create({
        idUsuario: usuario.idUsuario,
        aprobado: true
    });

    console.log('Data seeded.');
    return { ciudad, vendedor };
}

async function testHealthCheck() {
    console.log('\n--- Testing Health Check ---');
    try {
        const response = await fetch('http://127.0.0.1:3001/api/health');
        console.log('Health Check Status:', response.status);
        const text = await response.text();
        console.log('Health Check Response:', text);
    } catch (error) {
        console.error('Health Check Failed:', error.cause || error);
        throw error;
    }
}

async function testCreateTienda(ciudadId, vendedorId) {
    console.log('\n--- Testing Create Tienda ---');
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: 'Tienda de Juan',
            idVendedor: vendedorId,
            telefono: '0988888888',
            idCategoria: null, // Optional
            direccion: {
                calle_principal: 'Av. Amazonas',
                calle_secundaria: 'Naciones Unidas',
                idCiudad: ciudadId
            }
        })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    return data.data;
}

async function testGetTiendas() {
    console.log('\n--- Testing Get Tiendas ---');
    const response = await fetch(BASE_URL);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Count:', data.length);
    if (data.length > 0) {
        console.log('First Tienda:', data[0].nombre);
        console.log('Direccion:', data[0].direccion?.calle_principal);
    }
}

async function testUpdateTienda(id) {
    console.log('\n--- Testing Update Tienda ---');
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: 'Tienda de Juan UPDATED',
            direccion: {
                calle_principal: 'Av. Amazonas UPDATED'
            }
        })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data.message);
    console.log('Updated Name:', data.data.nombre);
}

async function testDeleteTienda(id) {
    console.log('\n--- Testing Delete Tienda ---');
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE'
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data.message);
}

async function run() {
    try {
        const { ciudad, vendedor } = await seedData();
        
        await testHealthCheck();

        // Allow server to recognize new data if there's any caching (unlikely)
        
        const nuevaTienda = await testCreateTienda(ciudad.idCiudad, vendedor.idVendedor);
        
        if (nuevaTienda && nuevaTienda.idTienda) {
            await testGetTiendas();
            await testUpdateTienda(nuevaTienda.idTienda);
            await testDeleteTienda(nuevaTienda.idTienda);
        } else {
            console.error('Failed to create tienda, aborting subsequent tests.');
        }

    } catch (error) {
        console.error('Error running tests:', error);
    } finally {
        // await sequelize.close(); // Keep connection open if server is running in same process? No, this is a script.
    }
}

run();
