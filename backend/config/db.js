const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'order_table_db_nodejs',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '12345678',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('[Sequelize] Kết nối MySQL thành công');
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('[Sequelize] Kết nối thất bại:', err);
  }
})();

module.exports = sequelize;