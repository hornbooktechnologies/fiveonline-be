const pool = require('../config/database');

const caseStudyDao = {
  async getAll() {
    const [rows] = await pool.execute('SELECT * FROM case_studies ORDER BY created_at DESC');
    return rows;
  },

  async getByPageUrl(pageUrl) {
    const [rows] = await pool.execute('SELECT * FROM case_studies WHERE page_url = ?', [pageUrl]);
    return rows[0];
  },

  async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM case_studies WHERE id = ?', [id]);
    return rows[0];
  },

  async create(data) {
    const { 
      page_url, sort_data, banner, improvement_section, 
      overview, thinking, built, website_info, que_ans 
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO case_studies 
      (page_url, sort_data, banner, improvement_section, overview, thinking, built, website_info, que_ans) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        page_url, 
        JSON.stringify(sort_data), 
        JSON.stringify(banner), 
        JSON.stringify(improvement_section), 
        JSON.stringify(overview), 
        JSON.stringify(thinking), 
        JSON.stringify(built), 
        JSON.stringify(website_info), 
        JSON.stringify(que_ans)
      ]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { 
      page_url, sort_data, banner, improvement_section, 
      overview, thinking, built, website_info, que_ans 
    } = data;

    const [result] = await pool.execute(
      `UPDATE case_studies SET 
        page_url = ?, 
        sort_data = ?, 
        banner = ?, 
        improvement_section = ?, 
        overview = ?, 
        thinking = ?, 
        built = ?, 
        website_info = ?, 
        que_ans = ? 
      WHERE id = ?`,
      [
        page_url, 
        JSON.stringify(sort_data), 
        JSON.stringify(banner), 
        JSON.stringify(improvement_section), 
        JSON.stringify(overview), 
        JSON.stringify(thinking), 
        JSON.stringify(built), 
        JSON.stringify(website_info), 
        JSON.stringify(que_ans),
        id
      ]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM case_studies WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async exists(pageUrl, excludeId = null) {
    let query = 'SELECT id FROM case_studies WHERE page_url = ?';
    const params = [pageUrl];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  }
};

module.exports = caseStudyDao;
