const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SHOP_OWNER: 'SHOP_OWNER',
  SHOP_MANAGER: 'SHOP_MANAGER',
  DELIVERY_STAFF: 'DELIVERY_STAFF',
  CUSTOMER: 'CUSTOMER',
};

const ShopStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
};

const SubscriptionStatus = {
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  GRACE_PERIOD: 'GRACE_PERIOD',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

const OrderStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  PREPARING: 'PREPARING',
  DELIVERY_ASSIGNED: 'DELIVERY_ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED_DELIVERY: 'FAILED_DELIVERY',
  CANCELLED: 'CANCELLED',
};

const DeliveryAssignmentStatus = {
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
};

const CODStatus = {
  PENDING_COLLECTION: 'PENDING_COLLECTION',
  COLLECTED: 'COLLECTED',
  RECONCILED: 'RECONCILED',
};

const NotificationChannel = {
  IN_APP: 'IN_APP',
  WHATSAPP: 'WHATSAPP',
  EMAIL: 'EMAIL',
  SMS: 'SMS',
};

const NotificationDeliveryStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
};

const InventoryMovementType = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  ADJUSTMENT_ADD: 'ADJUSTMENT_ADD',
  ADJUSTMENT_REMOVE: 'ADJUSTMENT_REMOVE',
  RETURN: 'RETURN',
  LOSS: 'LOSS',
};

const MembershipRole = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  DELIVERY_STAFF: 'DELIVERY_STAFF',
};

// Valid transitions for order status machine
const ORDER_TRANSITIONS = {
  [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.DELIVERY_ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERY_ASSIGNED]: [OrderStatus.PICKED_UP],
  [OrderStatus.PICKED_UP]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.FAILED_DELIVERY],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.REJECTED]: [],
  [OrderStatus.FAILED_DELIVERY]: [OrderStatus.DELIVERY_ASSIGNED],
  [OrderStatus.CANCELLED]: [],
};

module.exports = {
  UserRole,
  ShopStatus,
  SubscriptionStatus,
  OrderStatus,
  DeliveryAssignmentStatus,
  CODStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
  InventoryMovementType,
  MembershipRole,
  ORDER_TRANSITIONS,
};
