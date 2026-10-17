const cartRepo = require('../repositories/cart.repository');
const productRepo = require('../repositories/product.repository');
const { NotFoundError, AppError, ConflictError } = require('../utils/errors');

const getCart = async (customerId) => {
  return cartRepo.findByCustomer(customerId);
};

const addItem = async (customerId, { variantId, qty }) => {
  // Verify variant exists, is available and has stock
  const variant = await productRepo.findVariantById(variantId);
  if (!variant || !variant.product.isActive || variant.product.isArchived) {
    throw new NotFoundError('Product');
  }
  if (!variant.isAvailable || variant.stockQty < qty) {
    throw new AppError(`Only ${variant.stockQty} unit(s) available`, 409);
  }

  const shopId = variant.product.shopId;

  // If customer already has a cart for a different shop, reject with a clear code
  const existingCart = await cartRepo.findByCustomer(customerId);
  if (existingCart && existingCart.shopId !== shopId) {
    throw new ConflictError(
      'Your cart already has items from another shop. Clear your cart to add items from this shop.'
    );
  }

  const cart = await cartRepo.upsertCart(customerId, shopId);

  // Cap qty at available stock
  const existing = await cartRepo.findItemByCartAndVariant(cart.id, variantId);
  const newQty = Math.min((existing?.qty ?? 0) + qty, variant.stockQty);

  await cartRepo.upsertItem(cart.id, variantId, newQty, variant.price);

  return cartRepo.findByCustomer(customerId);
};

const updateItem = async (customerId, itemId, qty) => {
  const item = await cartRepo.findItemById(itemId);
  if (!item || item.cart.customerId !== customerId) {
    throw new NotFoundError('Cart item');
  }

  if (qty === 0) {
    await cartRepo.deleteItem(itemId);
  } else {
    const variant = await productRepo.findVariantById(item.variantId);
    if (variant && variant.stockQty < qty) {
      throw new AppError(`Only ${variant.stockQty} unit(s) available`, 409);
    }
    await cartRepo.updateItemQty(itemId, qty);
  }

  return cartRepo.findByCustomer(customerId);
};

const removeItem = async (customerId, itemId) => {
  const item = await cartRepo.findItemById(itemId);
  if (!item || item.cart.customerId !== customerId) {
    throw new NotFoundError('Cart item');
  }
  await cartRepo.deleteItem(itemId);

  // Remove cart if now empty
  const cart = await cartRepo.findByCustomer(customerId);
  if (cart && cart.items.length === 0) {
    await cartRepo.deleteCart(cart.id);
    return null;
  }
  return cartRepo.findByCustomer(customerId);
};

const clearCart = async (customerId) => {
  const cart = await cartRepo.findByCustomer(customerId);
  if (cart) {
    await cartRepo.clearCart(cart.id);
    await cartRepo.deleteCart(cart.id);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
