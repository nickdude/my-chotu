const cartService = require('../services/cart.service');
const { success } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.sub);
  return success(res, cart);
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.sub, req.body);
  return success(res, cart, 'Item added to cart');
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.sub, req.params.itemId, req.body.qty);
  return success(res, cart);
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.sub, req.params.itemId);
  return success(res, cart);
});

const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user.sub);
  return success(res, null, 'Cart cleared');
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
