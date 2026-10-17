const prisma  = require('../config/prisma');
const logger  = require('../utils/logger');
const inApp   = require('./channels/inApp');
const whatsapp = require('./channels/whatsapp');
const { template } = require('./templates');

/**
 * Creates an in-app notification for userId and dispatches to external
 * channels asynchronously (fire-and-forget so the main flow never blocks).
 *
 * @param {string}   userId   - recipient user ID
 * @param {string}   type     - notification type key (see templates.js)
 * @param {object}   payload  - template variables
 * @param {object}   [opts]   - { phone } for WhatsApp
 */
const notify = async (userId, type, payload = {}, opts = {}) => {
  try {
    const { title, body } = template(type, payload);

    const notification = await prisma.notification.create({
      data: { userId, type, title, body, metadata: payload },
    });

    // In-app is synchronous baseline
    await inApp.send(notification.id);

    // External channels fire-and-forget
    if (opts.phone) {
      whatsapp.send(notification.id, opts.phone, title, body).catch(
        (err) => logger.error(`[notify] WhatsApp dispatch error: ${err.message}`)
      );
    }

    return notification;
  } catch (err) {
    // Never let a notification failure break the calling operation
    logger.error(`[notify] Failed to create notification for ${userId}: ${err.message}`);
    return null;
  }
};

/**
 * Notify multiple users at once (e.g. broadcast to all shop members).
 */
const notifyMany = (userIds, type, payload, opts = {}) =>
  Promise.all(userIds.map((id) => notify(id, type, payload, opts)));

module.exports = { notify, notifyMany };
