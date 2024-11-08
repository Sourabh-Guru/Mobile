const express = require('express');
const path = require('path');
const app = express();

const dotenv =require("dotenv");
dotenv.config();

const db = require("./config/db")

// Serve all files from the public directory
app.use(express.static(__dirname));

// Set up specific routes (optional)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));


app.post('/fromPost',(req,res)=>{
    console.log(req,body);
    
})

// Users APIs
app.post("/users", (req, res) => {
    const fullName = req.body.full_name;
    const email = req.body.email;
    const phone_number = req.body.phone_number;
 
    try {
        db.query(
            'INSERT INTO users (full_name, email, phone_number) VALUES (?, ?, ?)',
            [fullName, email, phone_number],
            (err, rows) => {
                if (err) {
                    console.log(err);  
                } else {
                    res.redirect("/index") 
                }
            }
        );
    } catch (error) {
        console.log(err)
    
    }
});


// Get all users
app.get('/login.html', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
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

// Get user addresses
app.get('/api/users/:userId/addresses', (req, res) => {
    const userId = req.params.userId;
    db.query('SELECT * FROM addresses WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
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


