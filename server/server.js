const app = require('./app');
const pool = require('./config/db.config');
const { dbConfig } = require('./config/db.config');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`📊 Host: ${dbConfig.host}`);
        console.log(`📦 Database: ${dbConfig.database}`);
        console.log(`🔌 Port: ${dbConfig.port}`);
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Please check your database configuration in .env file');
    }
};

testConnection();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});