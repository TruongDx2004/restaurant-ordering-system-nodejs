const Table = require("../schemas/tableSchema");

module.exports = {

  CreateTable: async function (data) {
    return await Table.create(data);
  },

  GetAllTables: async function () {
    return await Table.findAll();
  },

  GetTableById: async function (id) {
    const table = await Table.findByPk(id);
    if (!table) throw new Error("Không tìm thấy bàn");
    return table;
  },

  UpdateTable: async function (id, data) {
    const table = await Table.findByPk(id);
    if (!table) throw new Error("Không tìm thấy bàn");

    return await table.update(data);
  },

  DeleteTable: async function (id) {
    const table = await Table.findByPk(id);
    if (!table) throw new Error("Không tìm thấy bàn");

    return await table.destroy();
  },

  GetTableByNumber: async function (tableNumber) {
    return await Table.findOne({ where: { tableNumber } });
  },

  GetTablesByStatus: async function (status) {
    return await Table.findAll({ where: { status } });
  },

  GetTablesByArea: async function (area) {
    return await Table.findAll({ where: { area } });
  },

  UpdateTableStatus: async function (id, status) {
    const table = await Table.findByPk(id);
    if (!table) throw new Error("Không tìm thấy bàn");

    return await table.update({ status });
  },

  GetActiveTables: async function () {
    return await Table.findAll({ where: { isActive: true } });
  }

};  