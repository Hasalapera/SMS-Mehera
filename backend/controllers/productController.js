const pool= require('../db/db');

const addProduct = async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, description, price, stock } = req.body;
        const result = await client.query(
            'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING product_id',
            [name, description, price, stock]
        );
        res.status(201).json({ message: "Product added successfully!", productId: result.rows[0].product_id });
    } catch (err) {
        console.error("Add Product Backend Error:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
}