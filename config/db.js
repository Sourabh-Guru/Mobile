const mysql = require('mysql2');
const dotenv =require("dotenv");
dotenv.config();

// Database connection
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD, 
    database: process.env.DATABASE,
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Database connected');
    createTables(); // Call this function to ensure tables are created
});

function createTables() {
    db.query(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone_number VARCHAR(15) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err);
        } else {
          console.log("Users table checked/created");
        }
      }
    );
  }

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
    `, (err) => {
        if (err) console.error('Error creating addresses table:', err);
        else console.log('Addresses table checked/created');
    });

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
    `, (err) => {
        if (err) console.error('Error creating products table:', err);
        else console.log('Products table checked/created');
    });

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
    `, (err) => {
        if (err) console.error('Error creating orders table:', err);
        else console.log('Orders table checked/created');
    });

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
    `, (err) => {
        if (err) console.error('Error creating order_items table:', err);
        else console.log('Order items table checked/created');
    });


module.exports = db; 
