const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'order_table_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '12345678',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Sequelize kết nối MySQL thành công!'))
  .catch(err => console.error('❌ Sequelize kết nối thất bại:', err));

module.exports = sequelize;