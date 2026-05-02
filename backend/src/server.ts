import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDb = async () => {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS fridges (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT
    );
`);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        fridge_id INTEGER REFERENCES fridges(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        expiry_date DATE
    );
`);
    console.log(`Database ready`);
}
initDb();

// FRIDGES
app.get('/api/fridges', async (req, res) => {
    console.log(`GET /api/fridges - fetching all fridges`);
    try {
        const fridges = await pool.query(`SELECT * FROM fridges ORDER BY id ASC`);
        console.log(`Found ${fridges.rows.length} fridges`);
        res.json(fridges.rows);
    } catch (err) {
        console.error('GET error:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

app.post('/api/fridges', async (req, res) => {
    console.log('POST /api/fridges - body:', req.body);
    const { name, location } = req.body;
    if (!name || !location) {
        console.log('Rejected: missing parameter');
        return res.status(400).json({ error: 'All parameters are required' });
    }
    console.log(`Inserting fridge with name: "${name}" and location "${location}"`);
    try {
        const result = await pool.query(
            'INSERT INTO fridges (name, location) VALUES ($1, $2) RETURNING *',
            [name, location]
        );
        console.log('Inserted fridge:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST error:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

app.put('/api/fridges/:id', async (req, res) => {
    console.log(`PUT /api/fridges/${req.params.id} - body:`, req.body);
    const { name, location } = req.body;
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE fridges SET name = $1, location = $2 WHERE id = $3 RETURNING *',
            [name, location, id]
        );
        if (result.rowCount === 0) {
            console.log(`fridge ${id} not found`);
            return res.status(404).json({ error: 'fridge not found' });
        }
        console.log(`Updated fridge ${id}: name = ${name}, location = ${location}`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('PUT error:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

app.delete('/api/fridges/:id', async (req, res) => {
    console.log(`DELETE /api/fridges/${req.params.id}`);
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM fridges WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            console.log(`fridge ${id} not found for deletion`);
            return res.status(404).json({ error: 'fridge not found' });
        }
        console.log(`Deleted fridge ${id}`);
        res.json({ message: 'fridge deleted' });
    } catch (err) {
        console.error('DELETE error:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

// PRODUCTS
// CREATE TABLE IF NOT EXISTS products (
//     id SERIAL PRIMARY KEY,
//     fridge_id INTEGER REFERENCES fridges(id) ON DELETE CASCADE,
//     name TEXT NOT NULL,
//     quantity INTEGER DEFAULT 0,
//     expiry_date DATE
// );
app.get('/api/products', async (req, res) => {
    console.log(`GET /api/products - fetching all products`);
    try {
        const products = await pool.query(`SELECT * FROM products ORDER BY id ASC`);
        console.log(`Found ${products.rows.length} products`);
        res.json(products.rows);
    } catch (err) {
        console.error('GET error:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});


app.post('/api/products', async (req, res) => {
    console.log('POST /api/products - body:', req.body);
    const { fridge_id, name, quantity, expiry_date } = req.body;
    if (!name || !fridge_id ) {
        console.log('Rejected: missing fridge id or name');
        return res.status(400).json({ error: 'fridge id and name are required' });
    }

    const safeQuantity = quantity !== undefined ? quantity : 0;
    const safeExpiry = expiry_date || null;

    console.log(`Inserting product with name: "${name}" into fridge: "${fridge_id}", quantity: "${quantity}" expiry "${expiry_date}"`);
    try {
        const result = await pool.query(
            'INSERT INTO products (fridge_id, name, quantity, expiry_date) VALUES ($1, $2, $3, $4) RETURNING *',
            [fridge_id, name, safeQuantity, safeExpiry]
        );
        console.log('Inserted product:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST error:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    console.log(`PUT /api/products/${req.params.id} - body:`, req.body);
    const { id } = req.params;
    const { fridge_id, name, quantity, expiry_date } = req.body;

    const updates = [];
    const values = [];
    let idx = 1;

    if (fridge_id !== undefined) {
        updates.push( `fridge_id = $${idx++}` );
        values.push( fridge_id );
    }
    if (name !== undefined) {
        updates.push( `name = $${idx++}` );
        values.push( name );
    }
    if (quantity !== undefined) {
        updates.push( `quantity = $${idx++}` );
        values.push( quantity );
    }
    if (expiry_date !== undefined) {
        updates.push( `expiry_date = $${idx++}` );
        values.push( expiry_date );
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;

    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            console.log(`product ${id} not found`);
            return res.status(400).json({ error: 'No fields to update' });
        }
        console.log(`Updated product ${id}`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('PUT error:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    console.log(`DELETE /api/products/${req.params.id}`);
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            console.log(`product ${id} not found for deletion`);
            return res.status(404).json({ error: 'product not found' });
        }
        console.log(`Deleted product ${id}`);
        res.json({ message: 'product deleted' });
    } catch (err) {
        console.error('DELETE error:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

app.get('/api/products/low-stock', async (req, res) => {
    console.log(`GET /api/products/low-stock`);
    try {
        const result = await pool.query(`
        SELECT p.*, f.name as fridge_name
        FROM products p
        JOIN fridges f ON p.fridge_id = f.id 
        WHERE p.quantity < 5
        ORDER BY p.quantity ASC
        `);
        console.log(`Found ${result.rows.length} low-stock products`);
        res.json(result.rows);
    } catch (err) {
        console.error('GET low-stock error:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

app.get('/api/fridges/:fridgeId/products', async (req, res) => {
   const { fridgeId } = req.params;
   try {
       const result = await pool.query('SELECT * FROM products WHERE fridge_id = $1 ORDER BY id', [fridgeId]);
       res.json(result.rows);
   } catch (err) {
       res.status(500).json({ error: (err as Error).message });
   }
});

app.listen(port, () => console.log(`Server started on port ${port}`));
