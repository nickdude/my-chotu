const { PrismaClient } = require('@prisma/client');
const config = require('./env');

const prisma = new PrismaClient({
  log: config.isDev ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

module.exports = prisma;
