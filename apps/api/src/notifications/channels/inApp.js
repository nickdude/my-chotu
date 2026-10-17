const prisma = require('../../config/prisma');

/**
 * Creates an in-app notification record and a corresponding delivery attempt.
 * Always succeeds — in-app is the baseline channel.
 */
const send = async (notificationId) => {
  await prisma.notificationDeliveryAttempt.create({
    data: {
      notificationId,
      channel: 'IN_APP',
      status:  'SENT',
      sentAt:  new Date(),
    },
  });
};

module.exports = { send };
