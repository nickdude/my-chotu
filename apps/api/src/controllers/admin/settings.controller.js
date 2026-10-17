const prisma      = require('../../config/prisma');
const { success } = require('../../utils/response');
const { audit }   = require('../../utils/audit');
const asyncHandler = require('../../utils/asyncHandler');

const listSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
  return success(res, settings);
});

const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value, description } = req.body;

  const setting = await prisma.platformSetting.upsert({
    where:  { key },
    create: { key, value, description, updatedById: req.user.sub },
    update: { value, ...(description && { description }), updatedById: req.user.sub },
  });

  await audit(req.user.sub, 'PlatformSetting', key, 'UPDATED', { after: { value }, ip: req.ip });
  return success(res, setting);
});

module.exports = { listSettings, updateSetting };
