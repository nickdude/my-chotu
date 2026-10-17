const orderService = require('../../services/shopkeeper/order.service');
const { success, paginated } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const listOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await orderService.listOrders(req.shop.id, req.query);
  return paginated(res, orders, meta);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(req.shop.id, req.params.orderId);
  return success(res, order);
});

const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.shop.id, req.params.orderId, req.body, req.user.sub);
  return success(res, order, 'Order status updated');
});

module.exports = { listOrders, getOrder, updateStatus };
