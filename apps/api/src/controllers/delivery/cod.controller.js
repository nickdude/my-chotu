const codService = require('../../services/delivery/cod.service');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const collectCod = asyncHandler(async (req, res) => {
  const record = await codService.collectCod(req.user.sub, req.params.id, req.body.amountCollected);
  return success(res, record, 'COD recorded');
});

module.exports = { collectCod };
