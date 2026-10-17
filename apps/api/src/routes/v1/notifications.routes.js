const { Router } = require('express');
const prisma       = require('../../config/prisma');
const authenticate = require('../../middleware/authenticate');
const { success } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where:   { userId: req.user.sub },
    orderBy: { createdAt: 'desc' },
    take:    50,
  });
  const unread = notifications.filter((n) => !n.isRead).length;
  return success(res, { notifications, unread });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.sub },
    data:  { isRead: true },
  });
  return success(res, null);
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.sub, isRead: false },
    data:  { isRead: true },
  });
  return success(res, null, 'All notifications marked as read');
}));

module.exports = router;
