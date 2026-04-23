const masterDao = require('../dao/masterDao');

const getTableFromRequest = (type) => {
  const mapping = {
    'industry': 'industries',
    'revenue-goal': 'revenue_goals',
    'capability': 'capabilities',
    'business-problem': 'business_problems'
  };
  return mapping[type];
};

const getMasters = async (req, res, next) => {
  try {
    const tableName = getTableFromRequest(req.params.type);
    if (!tableName) return res.status(400).json({ message: 'Invalid master type' });
    
    const data = await masterDao.getMasters(tableName);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const createMaster = async (req, res, next) => {
  try {
    const tableName = getTableFromRequest(req.params.type);
    if (!tableName) return res.status(400).json({ message: 'Invalid master type' });
    
    const { name, sort_order } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const result = await masterDao.createMaster(tableName, { name, sort_order });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateMaster = async (req, res, next) => {
  try {
    const tableName = getTableFromRequest(req.params.type);
    if (!tableName) return res.status(400).json({ message: 'Invalid master type' });
    
    const { id } = req.params;
    const { name, sort_order } = req.body;
    
    const success = await masterDao.updateMaster(tableName, id, { name, sort_order });
    if (!success) return res.status(404).json({ message: 'Item not found' });
    
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const tableName = getTableFromRequest(req.params.type);
    if (!tableName) return res.status(400).json({ message: 'Invalid master type' });
    
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: 'Orders array is required' });
    }
    
    await masterDao.updateOrder(tableName, orders);
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteMaster = async (req, res, next) => {
  try {
    const tableName = getTableFromRequest(req.params.type);
    if (!tableName) return res.status(400).json({ message: 'Invalid master type' });
    
    const { id } = req.params;
    const success = await masterDao.deleteMaster(tableName, id);
    if (!success) return res.status(404).json({ message: 'Item not found' });
    
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMasters,
  createMaster,
  updateMaster,
  updateOrder,
  deleteMaster,
};
