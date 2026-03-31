const ExcelJS = require('exceljs');
const { User, Table, Category, Dish } = require('../schemas');
const sequelize = require('../config/db');
const responseHandler = require('../utils/responseHandler');
const bcrypt = require('bcrypt');

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
      name: getCellValue(row.getCell(2)),
      price: Number(getCellValue(row.getCell(3))),
      status: getCellValue(row.getCell(4)) || 'AVAILABLE',
      categoryName: getCellValue(row.getCell(5)),
      image: getCellValue(row.getCell(6)) || ''
    })
  },
  category: {
    model: Category,
    columns: [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tên danh mục', key: 'name', width: 30 }
    ],
    mapRow: (row) => ({
      name: getCellValue(row.getCell(2))
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
      tableNumber: getCellValue(row.getCell(2)),
      area: getCellValue(row.getCell(3)) || 'Khu vực 1',
      status: getCellValue(row.getCell(4)) || 'AVAILABLE',
      isActive: getCellValue(row.getCell(5)) === 'TRUE' || getCellValue(row.getCell(5)) === true
    })
  },
  user: {
    model: User,
    columns: [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Họ tên', key: 'name', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 20 },
      { header: 'Vai trò', key: 'role', width: 15 },
      { header: 'Ngày tạo', key: 'createdAt', width: 20 },
    ],
    mapRow: async (row) => ({
      email: getCellValue(row.getCell(2)),
      name: getCellValue(row.getCell(3)),
      phone: getCellValue(row.getCell(4)),
      role: getCellValue(row.getCell(5)) || 'EMPLOYEE',
      password: await bcrypt.hash('123456', 10),
      createdAt: new Date(getCellValue(row.getCell(6))) || Date.now(),
      isActive: getCellValue(row.getCell(7)) === 'TRUE' || getCellValue(row.getCell(8)) === true
    })
  }
};

const getCellValue = (cell) => {
  if (!cell) return null;

  if (typeof cell === 'object') {
    return cell.text || cell.richText?.map(t => t.text).join('') || null;
  }

  return cell;
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
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      rows.push(await config.mapRow(row));
    }

    if (config.model === Dish) {

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
            const [newCategory, created] = await Category.findOrCreate({
              where: { name: row.categoryName },
              defaults: {},
              transaction: t
            });

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
        validate: true,
        ignoreDuplicates: true
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
