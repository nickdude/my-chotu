const prisma = require('../../config/prisma');
const config = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Sends a WhatsApp message via the Meta Business Platform API.
 * Stub: logs in dev, calls real API when credentials are configured.
 */
const send = async (notificationId, phone, title, body) => {
  const attempt = await prisma.notificationDeliveryAttempt.create({
    data: { notificationId, channel: 'WHATSAPP', status: 'PENDING' },
  });

  if (!config.whatsapp?.accessToken || config.isDev) {
    logger.info(`[WhatsApp stub] To: ${phone} | ${title}: ${body}`);
    await prisma.notificationDeliveryAttempt.update({
      where: { id: attempt.id },
      data:  { status: 'SENT', sentAt: new Date() },
    });
    return;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${config.whatsapp.phoneNumberId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization: `Bearer ${config.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: `*${title}*\n${body}` },
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));

    await prisma.notificationDeliveryAttempt.update({
      where: { id: attempt.id },
      data:  { status: 'SENT', sentAt: new Date(), providerResponse: json },
    });
  } catch (err) {
    logger.error(`[WhatsApp] Failed for ${phone}: ${err.message}`);
    await prisma.notificationDeliveryAttempt.update({
      where: { id: attempt.id },
      data:  { status: 'FAILED', failedAt: new Date(), providerResponse: { error: err.message } },
    });
  }
};

module.exports = { send };
