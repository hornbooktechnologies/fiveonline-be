const db = require('../config/database');

const VALID_TABLES = ['industries', 'revenue_goals', 'capabilities', 'business_problems'];

const validateTable = (tableName) => {
  if (!VALID_TABLES.includes(tableName)) {
    throw new Error('Invalid table name');
  }
};

/* ───── CREATE ───── */
const createMaster = async (tableName, data) => {
  validateTable(tableName);
  const { name, sort_order } = data;
  
  // Get max sort_order if not provided
  let order = sort_order;
  if (order === undefined) {
    const [rows] = await db.query(`SELECT MAX(sort_order) as max_order FROM ${tableName}`);
    order = (rows[0].max_order || 0) + 1;
  }

  const [result] = await db.query(
    `INSERT INTO ${tableName} (name, sort_order) VALUES (?, ?)`,
    [name, order]
  );
  return { id: result.insertId, name, sort_order: order };
};

/* ───── READ ───── */
const getMasters = async (tableName) => {
  validateTable(tableName);
  const [rows] = await db.query(`SELECT * FROM ${tableName} ORDER BY sort_order ASC`);
  return rows;
};

const getMasterById = async (tableName, id) => {
  validateTable(tableName);
  const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
  return rows[0];
};

/* ───── UPDATE ───── */
const updateMaster = async (tableName, id, data) => {
  validateTable(tableName);
  const { name, sort_order } = data;
  
  const [result] = await db.query(
    `UPDATE ${tableName} SET name = ?, sort_order = ? WHERE id = ?`,
    [name, sort_order, id]
  );
  return result.affectedRows > 0;
};

const updateOrder = async (tableName, orders) => {
  validateTable(tableName);
  // orders: [{ id: 1, sort_order: 1 }, { id: 2, sort_order: 2 }, ...]
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const item of orders) {
      await connection.query(
        `UPDATE ${tableName} SET sort_order = ? WHERE id = ?`,
        [item.sort_order, item.id]
      );
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/* ───── DELETE ───── */
const deleteMaster = async (tableName, id) => {
  validateTable(tableName);
  const [result] = await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createMaster,
  getMasters,
  getMasterById,
  updateMaster,
  updateOrder,
  deleteMaster,
};
