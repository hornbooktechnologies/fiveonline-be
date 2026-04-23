const caseStudyDao = require('../dao/caseStudyDao');

const caseStudyController = {
  async getAll(req, res) {
    try {
      const caseStudies = await caseStudyDao.getAll();
      res.json(caseStudies);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching case studies', error: error.message });
    }
  },

  async getByPageUrl(req, res) {
    try {
      const caseStudy = await caseStudyDao.getByPageUrl(req.params.page_url);
      if (!caseStudy) {
        return res.status(404).json({ message: 'Case study not found' });
      }
      res.json(caseStudy);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching case study', error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const caseStudy = await caseStudyDao.getById(req.params.id);
      if (!caseStudy) {
        return res.status(404).json({ message: 'Case study not found' });
      }
      res.json(caseStudy);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching case study', error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { page_url } = req.body;
      
      // Check for unique page_url
      const exists = await caseStudyDao.exists(page_url);
      if (exists) {
        return res.status(400).json({ message: 'Page URL already exists' });
      }

      const id = await caseStudyDao.create(req.body);
      res.status(201).json({ message: 'Case study created successfully', id });
    } catch (error) {
      res.status(500).json({ message: 'Error creating case study', error: error.message });
    }
  },

  async update(req, res) {
    try {
      const id = req.params.id;
      const { page_url } = req.body;

      // Check if case study exists
      const current = await caseStudyDao.getById(id);
      if (!current) {
        return res.status(404).json({ message: 'Case study not found' });
      }

      // Check for unique page_url (excluding current ID)
      const exists = await caseStudyDao.exists(page_url, id);
      if (exists) {
        return res.status(400).json({ message: 'Page URL already exists' });
      }

      await caseStudyDao.update(id, req.body);
      res.json({ message: 'Case study updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating case study', error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const success = await caseStudyDao.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Case study not found' });
      }
      res.json({ message: 'Case study deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting case study', error: error.message });
    }
  }
};

module.exports = caseStudyController;
