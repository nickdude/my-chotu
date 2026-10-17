const orderService = require('../services/order.service');
const { success, created, paginated } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user.sub, req.body);
  return created(res, order, 'Order placed successfully');
});

const getOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await orderService.getOrders(req.user.sub, req.query);
  return paginated(res, orders, meta);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderDetail(req.user.sub, req.params.orderId);
  return success(res, order);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.user.sub, req.params.orderId, req.body.reason);
  return success(res, order, 'Order cancelled');
});

module.exports = { placeOrder, getOrders, getOrder, cancelOrder };
