const ExcelJS = require("exceljs");
const { User, Table, Category, Dish } = require("../schemas");
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const getCellValue = (cell) => {
  if (!cell) return null;

  if (typeof cell === "object") {
    return (
      cell.text ||
      cell.richText?.map((t) => t.text).join("") ||
      null
    );
  }

  return cell;
};

const sanitize = (str) => {
  if (!str) return "";
  return String(str).trim();  
};

const validateNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? null : num;
};


const entityConfigs = {
  dish: {
    model: Dish,
    columns: [
      { header: "ID", key: "id", width: 10 },
      { header: "Tên món", key: "name", width: 30 },
      { header: "Giá", key: "price", width: 15 },
      { header: "Trạng thái", key: "status", width: 15 },
      { header: "Tên Danh mục", key: "categoryName", width: 20 },
      { header: "Link ảnh", key: "image", width: 40 },
    ],

    mapRow: (row, index) => {
      const name = sanitize(getCellValue(row.getCell(2)));
      const price = validateNumber(getCellValue(row.getCell(3)));
      let status = sanitize(getCellValue(row.getCell(4))) || "AVAILABLE";
      const categoryName = sanitize(getCellValue(row.getCell(5)));
      const image = sanitize(getCellValue(row.getCell(6)));

      if (!name) throw new Error(`Dòng ${index}: Thiếu tên món`);
      if (price === null) throw new Error(`Dòng ${index}: Giá không hợp lệ`);
      if (!categoryName) throw new Error(`Dòng ${index}: Thiếu danh mục`);

      if (!["AVAILABLE", "SOLD_OUT"].includes(status)) {
        status = "AVAILABLE";
      }

      return { name, price, status, categoryName, image };
    },
  },

  category: {
    model: Category,
    columns: [
      { header: "ID", key: "id", width: 10 },
      { header: "Tên danh mục", key: "name", width: 30 },
    ],

    mapRow: (row, index) => {
      const name = sanitize(getCellValue(row.getCell(2)));

      if (!name) throw new Error(`Dòng ${index}: Thiếu tên danh mục`);

      return { name };
    },
  },

  table: {
    model: Table,
    columns: [
      { header: "ID", key: "id", width: 10 },
      { header: "Số bàn", key: "tableNumber", width: 15 },
      { header: "Khu vực", key: "area", width: 15 },
      { header: "Trạng thái", key: "status", width: 15 },
      { header: "Đang hoạt động", key: "isActive", width: 15 },
    ],

    mapRow: (row, index) => {
      const tableNumber = sanitize(getCellValue(row.getCell(2)));
      const area = sanitize(getCellValue(row.getCell(3))) || "Khu vực 1";
      let status = sanitize(getCellValue(row.getCell(4))) || "AVAILABLE";

      const isActive =
        getCellValue(row.getCell(5)) === true ||
        getCellValue(row.getCell(5)) === "TRUE";

      if (!tableNumber)
        throw new Error(`Dòng ${index}: Thiếu số bàn`);

      if (!["AVAILABLE", "SOLD_OUT"].includes(status)) {
        status = "AVAILABLE";
      }

      return { tableNumber, area, status, isActive };
    },
  },

  user: {
    model: User,
    columns: [
      { header: "ID", key: "id", width: 10 },
      { header: "Email", key: "email", width: 25 },
      { header: "Họ tên", key: "name", width: 30 },
      { header: "SĐT", key: "phone", width: 20 },
      { header: "Vai trò", key: "role", width: 15 },
    ],

    mapRow: async (row, index) => {
      const email = sanitize(getCellValue(row.getCell(2)));
      const name = sanitize(getCellValue(row.getCell(3)));
      const phone = sanitize(getCellValue(row.getCell(4)));
      const role = sanitize(getCellValue(row.getCell(5))) || "EMPLOYEE";

      if (!email) throw new Error(`Dòng ${index}: Thiếu email`);
      if (!name) throw new Error(`Dòng ${index}: Thiếu tên`);

      const password = await bcrypt.hash("123456", 10);

      return { email, name, phone, role, password };
    },
  },
};

const ExportData = async (entity) => {
  const config = entityConfigs[entity];
  if (!config) throw new Error("Entity không hợp lệ");

  let data;

  if (entity === "dish") {
    data = await Dish.findAll({
      include: [{ model: Category, as: "category", attributes: ["name"] }],
    });
  } else {
    data = await config.model.findAll();
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(entity.toUpperCase());

  worksheet.columns = config.columns;

  data.forEach((item) => {
    const json = item.toJSON();

    if (entity === "dish") {
      worksheet.addRow({
        id: json.id,
        name: json.name,
        price: json.price,
        status: json.status,
        categoryName: json.category?.name || "",
        image: json.image,
      });
    } else {
      worksheet.addRow(json);
    }
  });

  worksheet.getRow(1).font = { bold: true };

  return workbook;
};

const ImportData = async (entity, fileBuffer) => {
  const config = entityConfigs[entity];

  if (!config) throw new Error("Entity không hợp lệ");
  if (!fileBuffer) throw new Error("Thiếu file Excel");

  const t = await sequelize.transaction();

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error("File Excel không hợp lệ");

    const rows = [];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const rowData = await config.mapRow(
        worksheet.getRow(i),
        i
      );
      rows.push(rowData);
    }

    let processedRows = rows;

    // ===== DISH SPECIAL =====
    if (config.model === Dish) {
      const categories = await Category.findAll({ transaction: t });

      const map = {};
      categories.forEach((c) => {
        map[c.name.trim().toLowerCase()] = c.id;
      });

      processedRows = await Promise.all(
        rows.map(async (row) => {
          const key = row.categoryName.toLowerCase();
          let categoryId = map[key];

          if (!categoryId) {
            const [newCategory] = await Category.findOrCreate({
              where: { name: row.categoryName },
              transaction: t,
            });

            categoryId = newCategory.id;
            map[key] = categoryId;
          }

          return {
            name: row.name,
            price: row.price,
            status: row.status,
            categoryId,
            image: row.image,
          };
        })
      );
    }

    // ===== BULK INSERT =====
    const chunkSize = 50;

    for (let i = 0; i < processedRows.length; i += chunkSize) {
      const chunk = processedRows.slice(i, i + chunkSize);

      await config.model.bulkCreate(chunk, {
        transaction: t,
        validate: true,
        ignoreDuplicates: false,
      });
    }

    await t.commit();

    return {
      success: true,
      count: processedRows.length,
    };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = {
  ExportData,
  ImportData,
};