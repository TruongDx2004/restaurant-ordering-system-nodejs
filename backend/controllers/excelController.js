const ExcelJS = require("exceljs");
const { User, Table, Category, Dish } = require("../schemas");
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");

// ===== CONFIG =====
const entityConfigs = {
  dish: {
    model: Dish,
    columns: [
      { header: "ID", key: "id", width: 10 },
      { header: "Tên món", key: "name", width: 30 },
      { header: "Giá", key: "price", width: 15 },
      { header: "Trạng thái", key: "status", width: 15 },
      { header: "Tên Danh mục", key: "categoryName", width: 20 },
      { header: "Link ảnh", key: "image", width: 40 }
    ],
    mapRow: (row) => ({
      name: getCellValue(row.getCell(2)),
      price: Number(getCellValue(row.getCell(3))),
      status: getCellValue(row.getCell(4)) || "AVAILABLE",
      categoryName: getCellValue(row.getCell(5)),
      image: getCellValue(row.getCell(6)) || ""
    })
  },

  category: {
    model: Category,
    columns: [
      { header: "ID", key: "id", width: 10 },
      { header: "Tên danh mục", key: "name", width: 30 }
    ],
    mapRow: (row) => ({
      name: getCellValue(row.getCell(2))
    })
  },

  table: {
    model: Table,
    columns: [
      { header: "ID", key: "id", width: 10 },
      { header: "Số bàn", key: "tableNumber", width: 15 },
      { header: "Khu vực", key: "area", width: 15 },
      { header: "Trạng thái", key: "status", width: 15 },
      { header: "Đang hoạt động", key: "isActive", width: 15 }
    ],
    mapRow: (row) => ({
      tableNumber: getCellValue(row.getCell(2)),
      area: getCellValue(row.getCell(3)) || "Khu vực 1",
      status: getCellValue(row.getCell(4)) || "AVAILABLE",
      isActive:
        getCellValue(row.getCell(5)) === "TRUE" ||
        getCellValue(row.getCell(5)) === true
    })
  },

  user: {
    model: User,
    columns: [
      { header: "ID", key: "id", width: 10 },
      { header: "Email", key: "email", width: 20 },
      { header: "Họ tên", key: "name", width: 30 },
      { header: "Số điện thoại", key: "phone", width: 20 },
      { header: "Vai trò", key: "role", width: 15 }
    ],
    mapRow: async (row) => ({
      email: getCellValue(row.getCell(2)),
      name: getCellValue(row.getCell(3)),
      phone: getCellValue(row.getCell(4)),
      role: getCellValue(row.getCell(5)) || "EMPLOYEE",
      password: await bcrypt.hash("123456", 10)
    })
  }
};

// ===== HELPER =====
const getCellValue = (cell) => {
  if (!cell) return null;
  if (typeof cell === "object") {
    return cell.text || cell.richText?.map(t => t.text).join("") || null;
  }
  return cell;
};

// ===== EXPORT =====
module.exports = {

  ExportData: async function (entity) {
    const config = entityConfigs[entity];
    if (!config) throw new Error("Entity không hợp lệ");

    let data;

    if (entity === "dish") {
      data = await Dish.findAll({
        include: [{ model: Category, as: "category", attributes: ["name"] }]
      });
    } else {
      data = await config.model.findAll();
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(entity.toUpperCase());
    worksheet.columns = config.columns;

    data.forEach(item => {
      const json = item.toJSON();

      if (entity === "dish") {
        worksheet.addRow({
          id: json.id,
          name: json.name,
          price: json.price,
          status: json.status,
          categoryName: json.category?.name || "",
          image: json.image
        });
      } else {
        worksheet.addRow(json);
      }
    });

    worksheet.getRow(1).font = { bold: true };

    return workbook;
  },

  ImportData: async function (entity, fileBuffer) {
    const config = entityConfigs[entity];
    if (!config) throw new Error("Entity không hợp lệ");
    if (!fileBuffer) throw new Error("Vui lòng tải lên file excel");

    const t = await sequelize.transaction();

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);
      const worksheet = workbook.getWorksheet(1);

      const rows = [];
      for (let i = 2; i <= worksheet.rowCount; i++) {
        rows.push(await config.mapRow(worksheet.getRow(i)));
      }

      let processedRows = rows;

      // ===== DISH SPECIAL =====
      if (config.model === Dish) {
        const categories = await Category.findAll({ transaction: t });

        const map = {};
        categories.forEach(c => {
          map[c.name.trim().toLowerCase()] = c.id;
        });

        processedRows = await Promise.all(
          rows.map(async row => {
            const name = row.categoryName?.trim().toLowerCase();
            let categoryId = map[name];

            if (!categoryId) {
              const [newCategory] = await Category.findOrCreate({
                where: { name: row.categoryName },
                transaction: t
              });

              categoryId = newCategory.id;
              map[name] = categoryId;
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
      }

      // ===== BULK INSERT =====
      const chunkSize = 50;
      let count = 0;

      for (let i = 0; i < processedRows.length; i += chunkSize) {
        const chunk = processedRows.slice(i, i + chunkSize);

        await config.model.bulkCreate(chunk, {
          transaction: t,
          validate: true,
          ignoreDuplicates: true
        });

        count += chunk.length;
      }

      await t.commit();
      return { count };

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

};