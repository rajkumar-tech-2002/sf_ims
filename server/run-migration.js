const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'ims',
            multipleStatements: true
        });
        
        const sql = fs.readFileSync('./database/migrate_users.sql', 'utf8');
        console.log('Executing migration...');
        await connection.query(sql);
        console.log('Migration successful!');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
