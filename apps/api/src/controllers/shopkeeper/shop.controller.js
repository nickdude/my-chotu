const shopService        = require('../../services/shopkeeper/shop.service');
const subscriptionService = require('../../services/subscription.service');
const { success, created } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');
const config = require('../../config/env');

const registerShop = asyncHandler(async (req, res) => {
  const shop = await shopService.registerShop(req.user.sub, req.body);
  return created(res, shop, 'Shop registered successfully');
});

const getShop = asyncHandler(async (req, res) => {
  const shop = await shopService.getShopDashboard(req.shop.id);
  const subscription = await subscriptionService.getForShop(req.shop.id);
  const daysRemaining = subscriptionService.trialDaysRemaining(subscription);
  const storefrontUrl = `${config.cors.origin}/shop/${shop.slug}`;
  const qrUrl         = `${storefrontUrl}?ref=qr`;
  return success(res, { shop, subscription, trialDaysRemaining: daysRemaining, storefrontUrl, qrUrl });
});

const updateShop = asyncHandler(async (req, res) => {
  const shop = await shopService.updateShop(req.shop.id, req.body);
  return success(res, shop, 'Shop updated');
});

const updateHours = asyncHandler(async (req, res) => {
  const hours = await shopService.updateHours(req.shop.id, req.body.hours);
  return success(res, hours, 'Operating hours updated');
});

module.exports = { registerShop, getShop, updateShop, updateHours };
