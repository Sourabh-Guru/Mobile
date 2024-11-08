// Required dependencies
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());   
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // default XAMPP password
    database: 'mobile_store'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Create tables if they don't exist
    createTables();
});

// Create necessary tables
function createTables() {
    // Users table
    db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone_number VARCHAR(15) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Addresses table
    db.query(`
        CREATE TABLE IF NOT EXISTS addresses (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT,
            full_name VARCHAR(100) NOT NULL,
            phone_number VARCHAR(15) NOT NULL,
            address_line1 TEXT NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            pincode VARCHAR(10) NOT NULL,
            is_default BOOLEAN DEFAULT false,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Products table
    db.query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(200) NOT NULL,
            brand VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            original_price DECIMAL(10,2) NOT NULL,
            color VARCHAR(50),
            storage VARCHAR(50),
            image_url VARCHAR(255),
            warranty_info TEXT,
            stock INT DEFAULT 0
        )
    `);

    // Orders table
    db.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT,
            address_id INT,
            total_amount DECIMAL(10,2) NOT NULL,
            order_status ENUM('confirmed', 'shipped', 'out_for_delivery', 'delivered') DEFAULT 'confirmed',
            tracking_number VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (address_id) REFERENCES addresses(id)
        )
    `);

    // Order Items table
    db.query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INT PRIMARY KEY AUTO_INCREMENT,
            order_id INT,
            product_id INT,
            quantity INT NOT NULL,
            price_at_time DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);
}

// API Endpoints

// User APIs
app.post('/api/users', (req, res) => {
    const { full_name, email, phone_number } = req.body;
    db.query(
        'INSERT INTO users (full_name, email, phone_number) VALUES (?, ?, ?)',
        [full_name, email, phone_number],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: result.insertId, message: 'User created successfully' });
        }
    );
});

// Address APIs
app.post('/api/addresses', (req, res) => {
    const { user_id, full_name, phone_number, address_line1, city, state, pincode } = req.body;
    db.query(
        'INSERT INTO addresses (user_id, full_name, phone_number, address_line1, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, full_name, phone_number, address_line1, city, state, pincode],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: result.insertId, message: 'Address added successfully' });
        }
    );
});

// Order APIs
app.post('/api/orders', (req, res) => {
    const { user_id, address_id, total_amount, items } = req.body;
    
    db.beginTransaction((err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Create order
        db.query(
            'INSERT INTO orders (user_id, address_id, total_amount) VALUES (?, ?, ?)',
            [user_id, address_id, total_amount],
            (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: err.message });
                    });
                }

                const order_id = result.insertId;

                // Insert order items
                const itemValues = items.map(item => [order_id, item.product_id, item.quantity, item.price]);
                db.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES ?',
                    [itemValues],
                    (err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ error: err.message });
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({ error: err.message });
                                });
                            }
                            res.status(201).json({
                                order_id,
                                message: 'Order placed successfully'
                            });
                        });
                    }
                );
            }
        );
    });
});

// Get order details
app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    db.query(
        `SELECT o.*, a.*, oi.*, p.name as product_name, p.image_url 
         FROM orders o 
         JOIN addresses a ON o.address_id = a.id 
         JOIN order_items oi ON o.id = oi.order_id 
         JOIN products p ON oi.product_id = p.id 
         WHERE o.id = ?`,
        [orderId],
        (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (results.length === 0) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.json(results);
        }
    );
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    db.query(
        'UPDATE orders SET order_status = ? WHERE id = ?',
        [status, req.params.id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Order status updated successfully' });
        }
    );
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});