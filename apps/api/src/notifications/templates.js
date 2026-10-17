/**
 * Returns { title, body } for a notification type + payload.
 * Keep copies short enough for push/WhatsApp previews.
 */
const template = (type, payload = {}) => {
  const map = {
    ORDER_PLACED: {
      title: 'New order received',
      body:  `Order #${payload.orderNumber} placed by ${payload.customerName}. ₹${payload.total}`,
    },
    ORDER_ACCEPTED: {
      title: 'Order confirmed!',
      body:  `Your order #${payload.orderNumber} from ${payload.shopName} has been accepted.`,
    },
    ORDER_REJECTED: {
      title: 'Order rejected',
      body:  `Your order #${payload.orderNumber} from ${payload.shopName} was rejected. ${payload.reason ?? ''}`.trim(),
    },
    ORDER_PREPARING: {
      title: 'Your order is being prepared',
      body:  `${payload.shopName} is preparing your order #${payload.orderNumber}.`,
    },
    ORDER_DELIVERY_ASSIGNED: {
      title: 'Delivery staff assigned',
      body:  `${payload.staffName} will deliver your order #${payload.orderNumber} shortly.`,
    },
    ORDER_PICKED_UP: {
      title: 'Order picked up',
      body:  `Your order #${payload.orderNumber} has been picked up and is on its way.`,
    },
    ORDER_OUT_FOR_DELIVERY: {
      title: 'Out for delivery',
      body:  `Your order #${payload.orderNumber} is out for delivery. Be ready!`,
    },
    ORDER_DELIVERED: {
      title: 'Order delivered!',
      body:  `Your order #${payload.orderNumber} from ${payload.shopName} has been delivered.`,
    },
    ORDER_CANCELLED: {
      title: 'Order cancelled',
      body:  `Order #${payload.orderNumber} has been cancelled. ${payload.reason ?? ''}`.trim(),
    },
    DELIVERY_ASSIGNED: {
      title: 'New delivery assigned',
      body:  `Order #${payload.orderNumber} has been assigned to you. ₹${payload.total} COD.`,
    },
    LOW_STOCK_ALERT: {
      title: 'Low stock alert',
      body:  `${payload.productName} has only ${payload.stockQty} unit(s) left.`,
    },
    SUBSCRIPTION_EXPIRING: {
      title: 'Trial ending soon',
      body:  `Your free trial ends in ${payload.daysLeft} day(s). Renew to keep accepting orders.`,
    },
  };
  return map[type] ?? { title: type, body: JSON.stringify(payload) };
};

module.exports = { template };
