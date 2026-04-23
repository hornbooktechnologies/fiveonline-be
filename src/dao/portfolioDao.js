const db = require('../config/database');

const createPortfolio = async (data) => {
  const { name, image_url, link, tags, industry_id, revenue_goal_id, capability_id, business_problem_id } = data;
  
  const [result] = await db.query(
    `INSERT INTO portfolio (name, image_url, link, tags, industry_id, revenue_goal_id, capability_id, business_problem_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, image_url, link, JSON.stringify(tags), industry_id, revenue_goal_id, capability_id, business_problem_id]
  );
  return { id: result.insertId, ...data };
};

const getPortfolios = async () => {
  const [rows] = await db.query(`
    SELECT p.*, 
           i.name as industry_name, 
           rg.name as revenue_goal_name, 
           c.name as capability_name, 
           bp.name as business_problem_name
    FROM portfolio p
    LEFT JOIN industries i ON p.industry_id = i.id
    LEFT JOIN revenue_goals rg ON p.revenue_goal_id = rg.id
    LEFT JOIN capabilities c ON p.capability_id = c.id
    LEFT JOIN business_problems bp ON p.business_problem_id = bp.id
    ORDER BY p.created_at DESC
  `);
  return rows.map(row => ({
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
  }));
};

const getPortfolioById = async (id) => {
  const [rows] = await db.query('SELECT * FROM portfolio WHERE id = ?', [id]);
  if (rows[0]) {
    rows[0].tags = typeof rows[0].tags === 'string' ? JSON.parse(rows[0].tags) : rows[0].tags;
  }
  return rows[0];
};

const updatePortfolio = async (id, data) => {
  const { name, image_url, link, tags, industry_id, revenue_goal_id, capability_id, business_problem_id } = data;
  
  const [result] = await db.query(
    `UPDATE portfolio 
     SET name = ?, image_url = ?, link = ?, tags = ?, industry_id = ?, revenue_goal_id = ?, capability_id = ?, business_problem_id = ? 
     WHERE id = ?`,
    [name, image_url, link, JSON.stringify(tags), industry_id, revenue_goal_id, capability_id, business_problem_id, id]
  );
  return result.affectedRows > 0;
};

const deletePortfolio = async (id) => {
  const [result] = await db.query('DELETE FROM portfolio WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createPortfolio,
  getPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
};
