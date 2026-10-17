require('dotenv').config({ path: '../../.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Default subscription plan
  const plan = await prisma.subscriptionPlan.upsert({
    where: { id: 'plan_starter' },
    update: {},
    create: {
      id: 'plan_starter',
      name: 'Starter',
      description: 'Perfect for small neighbourhood shops',
      priceMonthly: 299,
      billingPeriodDays: 30,
      trialDays: 30,
      gracePeriodDays: 7,
      maxProducts: 200,
      maxOrdersPerMonth: 500,
      maxStaff: 3,
      features: {
        qrCode: true,
        whatsappNotifications: true,
        analytics: true,
        bulkImport: false,
      },
    },
  });

  // Root categories
  const cats = ['Groceries', 'Bakery', 'Pharmacy', 'Electronics', 'Stationery', 'Dairy', 'Snacks & Beverages'];
  for (const name of cats) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  // Platform settings
  const settings = [
    { key: 'subscription.defaultTrialDays', value: 30, description: 'Default trial period in days' },
    { key: 'subscription.gracePeriodDays',  value: 7,  description: 'Grace period after expiry in days' },
    { key: 'order.maxCancellationMinutes',  value: 10, description: 'Minutes after placement customer can cancel' },
    { key: 'delivery.defaultRadiusKm',      value: 5,  description: 'Default delivery radius in km' },
  ];
  for (const s of settings) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value, description: s.description },
    });
  }

  console.log(`Seed complete — plan: ${plan.name}, categories: ${cats.length}, settings: ${settings.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
