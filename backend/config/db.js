const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'order_table_db_nodejs',
  'root',
  '12345678',
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('[Sequelize] Kết nối MySQL thành công');
    await sequelize.sync();
  } catch (err) {
    console.error('[Sequelize] Kết nối thất bại:', err);
  }
})();

module.exports = sequelize;