const addressService = require('../services/address.service');
const { success, created } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.sub);
  return success(res, addresses);
});

const addAddress = asyncHandler(async (req, res) => {
  const address = await addressService.addAddress(req.user.sub, req.body);
  return created(res, address, 'Address saved');
});

const setDefault = asyncHandler(async (req, res) => {
  const address = await addressService.setDefault(req.user.sub, req.params.id);
  return success(res, address, 'Default address updated');
});

module.exports = { listAddresses, addAddress, setDefault };
