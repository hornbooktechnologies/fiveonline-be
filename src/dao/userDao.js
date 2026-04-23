const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { BCRYPT_SALT_ROUNDS } = require('../config/constants');

/* ───── CREATE ───── */
const createUser = async (userData) => {
  const { builder_id, name, email, password, role_id, status } = userData;
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const [result] = await db.query(
    `INSERT INTO users (builder_id, name, email, password, role_id, status) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [builder_id || null, name, email, hashedPassword, role_id, status || 'active'],
  );
  return { id: result.insertId, builder_id, name, email, role_id, status: status || 'active' };
};

/* ───── READ ───── */
const findUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const getUsers = async (limit, offset, search = '', sortBy = 'created_at', sortOrder = 'DESC', builderId = null, excludeUserId = null) => {
  const allowedColumns = ['name', 'email', 'role_id', 'status', 'created_at'];
  const validatedSortBy = allowedColumns.includes(sortBy) ? sortBy : 'created_at';
  const validatedSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  let query = 'SELECT id, builder_id, name, email, role_id, status, created_at FROM users';
  let conditions = [];
  let params = [];

  if (builderId) {
    conditions.push('builder_id = ?');
    params.push(builderId);
  }

  if (excludeUserId) {
    conditions.push('id != ?');
    params.push(excludeUserId);
  }

  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ` ORDER BY ${validatedSortBy} ${validatedSortOrder}`;
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await db.query(query, params);
  return rows;
};

const getUsersByBuilderId = async (builderId, limit, offset) => {
  const [rows] = await db.query(
    'SELECT id, builder_id, name, email, role_id, status, created_at FROM users WHERE builder_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [builderId, limit, offset],
  );
  return rows;
};

const countUsers = async (search = '', builderId = null, excludeUserId = null) => {
  let query = 'SELECT COUNT(*) as count FROM users';
  let conditions = [];
  let params = [];

  if (builderId) {
    conditions.push('builder_id = ?');
    params.push(builderId);
  }

  if (excludeUserId) {
    conditions.push('id != ?');
    params.push(excludeUserId);
  }

  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const [rows] = await db.query(query, params);
  return rows[0].count;
};

const countUsersByBuilderId = async (builderId) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM users WHERE builder_id = ?',
    [builderId],
  );
  return rows[0].count;
};

/* ───── UPDATE ───── */
const updateUser = async (id, userData) => {
  const { builder_id, name, email, role_id, status, password } = userData;

  let query;
  let params;

  if (password) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    query = 'UPDATE users SET builder_id = ?, name = ?, email = ?, role_id = ?, status = ?, password = ? WHERE id = ?';
    params = [builder_id || null, name, email, role_id, status, hashedPassword, id];
  } else {
    query = 'UPDATE users SET builder_id = ?, name = ?, email = ?, role_id = ?, status = ? WHERE id = ?';
    params = [builder_id || null, name, email, role_id, status, id];
  }

  const [result] = await db.query(query, params);
  return result.affectedRows > 0;
};

const updateUserStatus = async (id, status) => {
  const [result] = await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  return result.affectedRows > 0;
};

const updateUserPassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  const [result] = await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  return result.affectedRows > 0;
};

/* ───── DELETE ───── */
const deleteUser = async (id) => {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createUser,
  findUserById,
  findUserByEmail,
  getUsers,
  getUsersByBuilderId,
  countUsers,
  countUsersByBuilderId,
  updateUser,
  updateUserStatus,
  updateUserPassword,
  deleteUser,
};
