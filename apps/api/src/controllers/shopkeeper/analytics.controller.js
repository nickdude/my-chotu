const analyticsService = require('../../services/shopkeeper/analytics.service');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getSummary(req.shop.id);
  return success(res, summary);
});

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await analyticsService.getTopProducts(req.shop.id);
  return success(res, products);
});

const getOrderTrend = asyncHandler(async (req, res) => {
  const days = Math.min(30, Math.max(7, parseInt(req.query.days, 10) || 7));
  const trend = await analyticsService.getOrderTrend(req.shop.id, days);
  return success(res, trend);
});

module.exports = { getSummary, getTopProducts, getOrderTrend };
