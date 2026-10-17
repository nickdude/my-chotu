const prisma = require('../config/prisma');

const CART_INCLUDE = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            select: { id: true, name: true, images: true, shopId: true },
          },
        },
      },
    },
  },
};

const findByCustomerAndShop = (customerId, shopId) =>
  prisma.cart.findUnique({
    where: { customerId_shopId: { customerId, shopId } },
    include: CART_INCLUDE,
  });

const findByCustomer = (customerId) =>
  prisma.cart.findFirst({
    where: { customerId },
    include: CART_INCLUDE,
  });

const upsertCart = (customerId, shopId) =>
  prisma.cart.upsert({
    where: { customerId_shopId: { customerId, shopId } },
    create: { customerId, shopId },
    update: {},
    include: CART_INCLUDE,
  });

const findItemByCartAndVariant = (cartId, variantId) =>
  prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });

const upsertItem = (cartId, variantId, qty, priceSnapshot) =>
  prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    create: { cartId, variantId, qty, priceSnapshot },
    update: { qty, priceSnapshot },
  });

const updateItemQty = (id, qty) =>
  prisma.cartItem.update({ where: { id }, data: { qty } });

const deleteItem = (id) =>
  prisma.cartItem.delete({ where: { id } });

const clearCart = (cartId) =>
  prisma.cartItem.deleteMany({ where: { cartId } });

const deleteCart = (id) =>
  prisma.cart.delete({ where: { id } });

const findItemById = (id) =>
  prisma.cartItem.findUnique({ where: { id }, include: { cart: true } });

module.exports = {
  findByCustomerAndShop,
  findByCustomer,
  upsertCart,
  findItemByCartAndVariant,
  upsertItem,
  updateItemQty,
  deleteItem,
  clearCart,
  deleteCart,
  findItemById,
};
