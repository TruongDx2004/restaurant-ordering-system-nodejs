const ExcelJS = require('exceljs');
const { User, Table, Category, Dish } = require('../schemas');
const sequelize = require('../config/db');
const responseHandler = require('../utils/responseHandler');

/**
 * Excel Controller
 * Xử lý Import/Export dữ liệu cho Dish, Category, Table, User
 */

const entityConfigs = {
  dish: {
    model: Dish,
    columns: [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tên món', key: 'name', width: 30 },
      { header: 'Giá', key: 'price', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Tên Danh mục', key: 'categoryName', width: 20 },
      { header: 'Link ảnh', key: 'image', width: 40 }
    ],
    mapRow: (row) => ({
      name: row.getCell(2).value,
      price: Number(row.getCell(3).value),
      status: row.getCell(4).value || 'AVAILABLE',
      categoryName: row.getCell(5).value,
      image: row.getCell(6).value || ''
    })
  },
  category: {
    model: Category,
    columns: [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tên danh mục', key: 'name', width: 30 }
    ],
    mapRow: (row) => ({
      name: row.getCell(2).value
    })
  },
  table: {
    model: Table,
    columns: [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Số bàn', key: 'tableNumber', width: 15 },
      { header: 'Khu vực', key: 'area', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Đang hoạt động', key: 'isActive', width: 15 }
    ],
    mapRow: (row) => ({
      tableNumber: row.getCell(2).value,
      area: row.getCell(3).value || 'CHUNG',
      status: row.getCell(4).value || 'AVAILABLE',
      isActive: row.getCell(5).value === 'TRUE' || row.getCell(5).value === true
    })
  },
  user: {
    model: User,
    columns: [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tên đăng nhập', key: 'email', width: 20 },
      { header: 'Họ tên', key: 'name', width: 30 },
      { header: 'Vai trò', key: 'role', width: 15 },
      { header: 'Hoạt động', key: 'isActive', width: 15 }
    ],
    mapRow: (row) => ({
      username: row.getCell(2).value,
      fullName: row.getCell(3).value,
      role: row.getCell(4).value || 'EMPLOYEE',
      password: row.getCell(5).value || '123456', // Mật khẩu mặc định nếu trống
      isActive: row.getCell(6).value === 'TRUE' || row.getCell(6).value === true
    })
  }
};

// ================= EXPORT =================
exports.exportData = async (req, res, next) => {
  try {
    const { entity } = req.params;
    const config = entityConfigs[entity];

    if (!config) {
      return responseHandler.error(res, 'Entity không hợp lệ', 400);
    }

    if (entity === 'dish') {
      data = await Dish.findAll({
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["name"]
          }
        ]
      });
    } else {
      data = await config.model.findAll();
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(entity.toUpperCase());

    worksheet.columns = config.columns;

    // Add rows
    data.forEach(item => {
      const json = item.toJSON();

      if (entity === 'dish') {
        worksheet.addRow({
          id: json.id,
          name: json.name,
          price: json.price,
          status: json.status,
          categoryName: json.category?.name || '',
          image: json.image
        });
      } else {
        worksheet.addRow(json);
      }
    });

    // Formatting header
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${entity}_export.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    next(err);
  }
};

// ================= IMPORT =================
exports.importData = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { entity } = req.params;
    const config = entityConfigs[entity];


    if (!config) {
      return responseHandler.error(res, 'Entity không hợp lệ', 400);
    }

    if (!req.file) {
      return responseHandler.error(res, 'Vui lòng tải lên file excel', 400);
    }

    

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);

    const rows = [];
    let processedRows;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Bỏ qua header
        rows.push(config.mapRow(row));
      }
    });

    if(config.model === Dish) {

      const categories = await Category.findAll({ transaction: t });

      // Map: name → id
      const categoryMap = {};
      categories.forEach(c => {
        categoryMap[c.name.trim().toLowerCase()] = c.id;
      });

      processedRows = await Promise.all(
        rows.map(async row => {
          const categoryName = row.categoryName?.trim().toLowerCase();

          let categoryId = categoryMap[categoryName];

          if (!categoryId) {
            const newCategory = await Category.create(
              { name: row.categoryName },
              { transaction: t }
            );

            categoryId = newCategory.id;
            categoryMap[categoryName] = categoryId;
          }

          return {
            name: row.name,
            price: row.price,
            status: row.status,
            categoryId,
            image: row.image
          };
        })
      );
    
    } else {
      processedRows = rows;
    }

    // Batch processing: Lưu mỗi lần 50 rows
    const chunkSize = 50;
    let importedCount = 0;

    for (let i = 0; i < processedRows.length; i += chunkSize) {
      const chunk = processedRows.slice(i, i + chunkSize);

      await config.model.bulkCreate(chunk, {
        transaction: t,
        validate: true
      });

      importedCount += chunk.length;
    }

    await t.commit();

    return responseHandler.success(
      res,
      { count: importedCount },
      `Import ${entity} thành công: ${importedCount} dòng`
    );

  } catch (err) {
    await t.rollback();
    console.error('[Excel Import Error]:', err);
    return responseHandler.error(res, `Lỗi import: ${err.message}`, 500);
  }
};
