const crypto = require('crypto');

const toSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Generates a unique slug within a scope (e.g. within a shop).
 * existsFn receives a candidate slug and returns true if it's taken.
 */
const uniqueSlug = async (base, existsFn) => {
  const candidate = toSlug(base);
  if (!(await existsFn(candidate))) return candidate;
  // Append a short random suffix to break collisions
  const suffix = crypto.randomBytes(2).toString('hex');
  return `${candidate}-${suffix}`;
};

module.exports = { toSlug, uniqueSlug };
