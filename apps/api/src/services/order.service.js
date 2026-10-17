const { Decimal } = require('@prisma/client/runtime/library');
const prisma = require('../config/prisma');
const cartRepo = require('../repositories/cart.repository');
const productRepo = require('../repositories/product.repository');
const shopRepo = require('../repositories/shop.repository');
const addressRepo = require('../repositories/address.repository');
const orderRepo = require('../repositories/order.repository');
const { AppError, NotFoundError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const { ORDER_TRANSITIONS, OrderStatus } = require('@my-chotu/shared');
const { ORDER_NUMBER_PREFIX } = require('@my-chotu/shared');
const { notify, notifyMany } = require('../notifications/notificationService');
const crypto = require('crypto');

const DELIVERY_FEE = new Decimal('30.00');
const FREE_DELIVERY_THRESHOLD = new Decimal('500.00');

const generateOrderNumber = () => {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${ORDER_NUMBER_PREFIX}-${ymd}-${rand}`;
};

const placeOrder = async (customerId, { shopId, addressId, notes }) => {
  // Validate shop is approved
  const shop = await shopRepo.findById(shopId);
  if (!shop) throw new NotFoundError('Shop');

  // Validate address belongs to customer
  const address = await addressRepo.findByIdAndUser(addressId, customerId);
  if (!address) throw new NotFoundError('Delivery address');

  // Fetch cart for this shop
  const cart = await cartRepo.findByCustomerAndShop(customerId, shopId);
  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  // Re-validate each item from DB (never trust client prices)
  const validatedItems = [];
  for (const item of cart.items) {
    const variant = await productRepo.findVariantById(item.variantId);

    if (!variant || !variant.product.isActive || variant.product.isArchived) {
      throw new AppError(`"${item.variant.product.name}" is no longer available`, 409);
    }
    if (!variant.isAvailable) {
      throw new AppError(`"${variant.product.name}" is currently unavailable`, 409);
    }
    if (variant.stockQty < item.qty) {
      throw new AppError(
        `Only ${variant.stockQty} unit(s) of "${variant.product.name}" left in stock`,
        409
      );
    }

    validatedItems.push({
      variantId:           variant.id,
      productNameSnapshot: variant.product.name,
      variantNameSnapshot: variant.name,
      qty:                 item.qty,
      unitPrice:           variant.price,
      total:               variant.price.mul(item.qty),
      stockQty:            variant.stockQty,
    });
  }

  // Server-side total calculation
  const subtotal = validatedItems.reduce((sum, i) => sum.add(i.total), new Decimal('0'));
  const deliveryFee = subtotal.gte(FREE_DELIVERY_THRESHOLD) ? new Decimal('0') : DELIVERY_FEE;
  const total = subtotal.add(deliveryFee);

  // Minimum order check
  if (shop.minOrderAmount && subtotal.lt(shop.minOrderAmount)) {
    throw new AppError(
      `Minimum order amount is ₹${shop.minOrderAmount}. Add ₹${shop.minOrderAmount.sub(subtotal)} more.`,
      400
    );
  }

  const deliveryAddressSnapshot = {
    label: address.label,
    line1: address.line1,
    line2: address.line2,
    city:  address.city,
    state: address.state,
    pincode: address.pincode,
    lat:   address.lat,
    lng:   address.lng,
  };

  // Fetch customer for name/phone snapshot
  const customer = await prisma.user.findUnique({ where: { id: customerId } });

  // Run everything atomically
  const order = await prisma.$transaction(async (tx) => {
    const orderNumber = generateOrderNumber();

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        shopId,
        addressId,
        subtotal,
        deliveryFee,
        discount:               new Decimal('0'),
        total,
        deliveryAddressSnapshot,
        customerNameSnapshot:   customer.name,
        customerPhoneSnapshot:  customer.phone ?? '',
        notes,
        items: {
          create: validatedItems.map((i) => ({
            variantId:           i.variantId,
            productNameSnapshot: i.productNameSnapshot,
            variantNameSnapshot: i.variantNameSnapshot,
            qty:                 i.qty,
            unitPrice:           i.unitPrice,
            total:               i.total,
          })),
        },
        statusHistory: {
          create: { toStatus: 'PENDING', reason: 'Order placed by customer' },
        },
      },
      include: {
        items: true,
        statusHistory: true,
        shop: { select: { id: true, name: true, slug: true, logoUrl: true } },
        codCollection: true,
      },
    });

    // Deduct inventory for each item
    for (const item of validatedItems) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stockQty: { decrement: item.qty } },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId:     item.variantId,
          shopId,
          type:          'SALE',
          qty:           -item.qty,
          balanceBefore: item.stockQty,
          balanceAfter:  item.stockQty - item.qty,
          reason:        `Order ${orderNumber}`,
          orderId:       newOrder.id,
          actorId:       customerId,
        },
      });
    }

    // Create COD collection record
    await tx.cODCollection.create({
      data: {
        orderId:   newOrder.id,
        // assignmentId will be set when delivery staff is assigned
        amountDue: total,
        status:    'PENDING_COLLECTION',
      },
    });

    // Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.delete({ where: { id: cart.id } });

    return newOrder;
  });

  // Notify shop owner(s) of new order
  const shopMembers = await prisma.shopMembership.findMany({
    where: { shopId, isActive: true, role: { in: ['OWNER', 'MANAGER'] } },
    select: { userId: true },
  });
  notifyMany(
    shopMembers.map((m) => m.userId),
    'ORDER_PLACED',
    { orderNumber: order.orderNumber, customerName: customer.name, total: total.toFixed(0) }
  );

  return order;
};

const getOrders = async (customerId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const [orders, total] = await orderRepo.findManyByCustomer(customerId, { skip, limit });
  return { orders, meta: { page, limit, total } };
};

const getOrderDetail = async (customerId, orderId) => {
  const order = await orderRepo.findByIdAndCustomer(orderId, customerId);
  if (!order) throw new NotFoundError('Order');
  return order;
};

const cancelOrder = async (customerId, orderId, reason) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, customerId } });
  if (!order) throw new NotFoundError('Order');

  const allowed = ORDER_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(OrderStatus.CANCELLED)) {
    throw new AppError(`Order cannot be cancelled in "${order.status}" status`, 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus:   'CANCELLED',
        reason,
        actorId:    customerId,
      },
    });

    // Return inventory only if not yet in delivery
    if (['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status)) {
      const items = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: { increment: item.qty } },
          });
          await tx.inventoryMovement.create({
            data: {
              variantId:     item.variantId,
              shopId:        order.shopId,
              type:          'RETURN',
              qty:           item.qty,
              balanceBefore: variant.stockQty,
              balanceAfter:  variant.stockQty + item.qty,
              reason:        `Cancellation of order ${order.orderNumber}`,
              orderId,
              actorId:       customerId,
            },
          });
        }
      }
    }

    return updatedOrder;
  });

  return orderRepo.findByIdAndCustomer(orderId, customerId);
};

module.exports = { placeOrder, getOrders, getOrderDetail, cancelOrder };
