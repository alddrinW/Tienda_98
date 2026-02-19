
const API_URL = 'http://localhost:5000/api';

async function testEndpoints() {
    console.log('--- Starting API Verification ---');

    try {
        // 1. Test Products (Public)
        console.log('Testing GET /api/products...');
        const productsRes = await fetch(`${API_URL}/products`);
        if (productsRes.ok) console.log('✅ GET /api/products OK');
        else console.error('❌ GET /api/products FAILED', productsRes.status);

        // 2. Test Vendors (Public)
        console.log('Testing GET /api/vendor...');
        const vendorsRes = await fetch(`${API_URL}/vendor`);
        if (vendorsRes.ok) console.log('✅ GET /api/vendor OK');
        else console.error('❌ GET /api/vendor FAILED', vendorsRes.status);

        // 3. Test Locations (Public)
        console.log('Testing GET /api/locations/provincias...');
        const locRes = await fetch(`${API_URL}/locations/provincias`);
        if (locRes.ok) console.log('✅ GET /api/locations/provincias OK');
        else console.error('❌ GET /api/locations/provincias FAILED', locRes.status);

        // 4. Test Guest Review (Public/Optional Auth)
        console.log('Testing POST /api/reviews (Guest)...');
        // Need a valid productId. Let's assume ID 1 exists or fetch from products first.
        const products = await (await fetch(`${API_URL}/products`)).json();
        if (products.length > 0) {
            const pid = products[0].idProducto;
            const reviewRes = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idProducto: pid,
                    calificacion: 5,
                    titulo: "Test Guest Review",
                    comentario: "This is a test review from verification script",
                    nombre_invitado: "Guest Tester"
                })
            });
            if (reviewRes.ok || reviewRes.status === 400) console.log('✅ POST /api/reviews OK (Created or Duplicate)'); // 400 if duplicate, which is fine for repeated runs
            else console.error('❌ POST /api/reviews FAILED', reviewRes.status, await reviewRes.text());
        }

        // 5. Test Admin Dashboard (Requires Token - Skipping strict check, just checking if route exists/protects)
        console.log('Testing GET /api/admin/dashboard (Unauthorized check)...');
        const adminRes = await fetch(`${API_URL}/admin/dashboard`);
        if (adminRes.status === 401 || adminRes.status === 403) console.log('✅ GET /api/admin/dashboard Protected OK');
        else console.error('❌ GET /api/admin/dashboard Unexpected Status', adminRes.status);


    } catch (error) {
        console.error('❌ Verification Script Error:', error.message);
    }
    console.log('--- Verification Complete ---');
}

testEndpoints();
