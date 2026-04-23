const portfolioDao = require('../dao/portfolioDao');

const getPortfolios = async (req, res, next) => {
  try {
    const data = await portfolioDao.getPortfolios();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const createPortfolio = async (req, res, next) => {
  try {
    const { name, link, tags, industry_id, revenue_goal_id, capability_id, business_problem_id } = req.body;
    
    if (!name || !req.file) {
      return res.status(400).json({ message: 'Name and image are required' });
    }

    const image_url = `${req.protocol}://${req.get('host')}/uploads/portfolio/${req.file.filename}`;
    
    // Parse tags if they come as string
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);

    const result = await portfolioDao.createPortfolio({
      name,
      image_url,
      link,
      tags: parsedTags,
      industry_id,
      revenue_goal_id,
      capability_id,
      business_problem_id
    });
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updatePortfolio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, link, tags, industry_id, revenue_goal_id, capability_id, business_problem_id } = req.body;
    
    const existing = await portfolioDao.getPortfolioById(id);
    if (!existing) return res.status(404).json({ message: 'Portfolio not found' });

    let image_url = existing.image_url;
    if (req.file) {
      image_url = `${req.protocol}://${req.get('host')}/uploads/portfolio/${req.file.filename}`;
    }

    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);

    const success = await portfolioDao.updatePortfolio(id, {
      name,
      image_url,
      link,
      tags: parsedTags,
      industry_id,
      revenue_goal_id,
      capability_id,
      business_problem_id
    });

    if (!success) return res.status(400).json({ message: 'Failed to update portfolio' });
    
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deletePortfolio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await portfolioDao.deletePortfolio(id);
    if (!success) return res.status(404).json({ message: 'Portfolio not found' });
    
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
