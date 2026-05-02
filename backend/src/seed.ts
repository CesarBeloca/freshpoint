import { Pool } from 'pg';

const pool = new Pool({
    user: 'admin',
    password: 'mysecretpassword',
    host: 'localhost',
    port: 5432,
    database: 'freshpoint_db',
});

const fridges = [
    { name: 'Freshpoint Anděl', location: 'Prague 5 - Anděl' },
    { name: 'Freshpoint Karlovo náměstí', location: 'Prague 2 - Karlovo náměstí' },
    { name: 'Freshpoint Dejvice', location: 'Prague 6 - Dejvice' },
    { name: 'Freshpoint Palmovka', location: 'Prague 8 - Palmovka' },
    { name: 'Freshpoint Smíchov', location: 'Prague 5 - Smíchov' },
    { name: 'Freshpoint Václavák', location: 'Prague 1 - Václavské náměstí' },
];

const productNames = [
    'Yogurt', 'Salad Bowl', 'Sandwich', 'Fruit Box', 'Chips', 'Protein Bar',
    'Coke', 'Water', 'Juice', 'Coffee', 'Apple', 'Banana', 'Croissant',
    'Muesli', 'Hummus', 'Carrot Sticks', 'Cheese Snack', 'Smoothie', 'Ice Tea',
    'Pasta Salad', 'Tuna Wrap', 'Vegan Burger', 'Quinoa Salad', 'Energy Drink',
    'Almond Milk', 'Granola', 'Cookie', 'Muffin', 'Crackers', 'Dark Chocolate'
];

async function seed() {
    console.log('Seeding database...');
    try {
        // Clear existing data
        await pool.query('DELETE FROM products');
        await pool.query('DELETE FROM fridges');

        // Insert fridges
        const fridgeIds: number[] = [];
        for (const fridge of fridges) {
            const res = await pool.query(
                'INSERT INTO fridges (name, location) VALUES ($1, $2) RETURNING id',
                [fridge.name, fridge.location]
            );
            fridgeIds.push(res.rows[0].id);
        }

        // Insert 30 products randomly distributed
        for (let i = 0; i < 30; i++) {
            const randomFridgeId = fridgeIds[Math.floor(Math.random() * fridgeIds.length)];
            const randomName = productNames[Math.floor(Math.random() * productNames.length)];
            const quantity = Math.floor(Math.random() * 10) + 1; // 1-10
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 10) + 1); // 1-10 days
            await pool.query(
                'INSERT INTO products (fridge_id, name, quantity, expiry_date) VALUES ($1, $2, $3, $4)',
                [randomFridgeId, randomName, quantity, expiryDate.toISOString().split('T')[0]]
            );
        }

        console.log('✅ Seeding complete!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        pool.end();
    }
}

seed();
