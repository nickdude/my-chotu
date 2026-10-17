const prisma      = require('../../config/prisma');
const { success, created } = require('../../utils/response');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { toSlug } = require('../../utils/slug');
const asyncHandler = require('../../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true, children: true } },
      children: { select: { id: true, name: true, slug: true } },
    },
    where:   { parentId: null },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  return success(res, categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, parentId, imageUrl, sortOrder } = req.body;
  const slug = toSlug(name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new ConflictError('A category with this name already exists');

  const category = await prisma.category.create({
    data: { name, slug, parentId, imageUrl, sortOrder: sortOrder ?? 0 },
  });
  return created(res, category, 'Category created');
});

const updateCategory = asyncHandler(async (req, res) => {
  const cat = await prisma.category.findUnique({ where: { id: req.params.categoryId } });
  if (!cat) throw new NotFoundError('Category');

  const { name, ...rest } = req.body;
  const data = { ...rest };
  if (name) { data.name = name; data.slug = toSlug(name); }

  const updated = await prisma.category.update({ where: { id: cat.id }, data });
  return success(res, updated);
});

const toggleCategory = asyncHandler(async (req, res) => {
  const cat = await prisma.category.findUnique({ where: { id: req.params.categoryId } });
  if (!cat) throw new NotFoundError('Category');
  const updated = await prisma.category.update({
    where: { id: cat.id },
    data:  { isActive: !cat.isActive },
  });
  return success(res, updated);
});

module.exports = { listCategories, createCategory, updateCategory, toggleCategory };
