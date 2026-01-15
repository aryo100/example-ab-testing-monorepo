import { PrismaClient, UserRole, FlagType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create environments
  const environments = await Promise.all([
    prisma.environment.upsert({
      where: { name: 'development' },
      update: {},
      create: { name: 'development' },
    }),
    prisma.environment.upsert({
      where: { name: 'staging' },
      update: {},
      create: { name: 'staging' },
    }),
    prisma.environment.upsert({
      where: { name: 'production' },
      update: {},
      create: { name: 'production' },
    }),
  ]);

  console.log('✅ Environments created');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created');

  // Create sample feature flags
  const flags = await Promise.all([
    // Boolean flag
    prisma.featureFlag.upsert({
      where: { key: 'dark_mode' },
      update: {},
      create: {
        key: 'dark_mode',
        name: 'Dark Mode',
        description: 'Enable dark mode for the application',
        type: FlagType.BOOLEAN,
        enabled: true,
        createdById: adminUser.id,
      },
    }),
    // Percentage rollout flag
    prisma.featureFlag.upsert({
      where: { key: 'new_checkout' },
      update: {},
      create: {
        key: 'new_checkout',
        name: 'New Checkout Flow',
        description: 'Gradually roll out the new checkout experience',
        type: FlagType.PERCENTAGE,
        enabled: true,
        createdById: adminUser.id,
      },
    }),
    // Variant flag
    prisma.featureFlag.upsert({
      where: { key: 'button_color' },
      update: {},
      create: {
        key: 'button_color',
        name: 'Button Color A/B Test',
        description: 'Test different button colors for conversion',
        type: FlagType.VARIANT,
        enabled: true,
        createdById: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Feature flags created');

  // Create variants for the variant flag
  const buttonColorFlag = flags.find((f) => f.key === 'button_color');
  if (buttonColorFlag) {
    await Promise.all([
      prisma.flagVariant.upsert({
        where: {
          flagId_key: { flagId: buttonColorFlag.id, key: 'control' },
        },
        update: {},
        create: {
          flagId: buttonColorFlag.id,
          key: 'control',
          weight: 50,
        },
      }),
      prisma.flagVariant.upsert({
        where: {
          flagId_key: { flagId: buttonColorFlag.id, key: 'variant_blue' },
        },
        update: {},
        create: {
          flagId: buttonColorFlag.id,
          key: 'variant_blue',
          weight: 25,
        },
      }),
      prisma.flagVariant.upsert({
        where: {
          flagId_key: { flagId: buttonColorFlag.id, key: 'variant_green' },
        },
        update: {},
        create: {
          flagId: buttonColorFlag.id,
          key: 'variant_green',
          weight: 25,
        },
      }),
    ]);
  }

  console.log('✅ Flag variants created');

  // Create flag targets
  const newCheckoutFlag = flags.find((f) => f.key === 'new_checkout');
  const productionEnv = environments.find((e) => e.name === 'production');
  
  if (newCheckoutFlag && productionEnv) {
    await prisma.flagTarget.upsert({
      where: {
        flagId_environmentId: {
          flagId: newCheckoutFlag.id,
          environmentId: productionEnv.id,
        },
      },
      update: {},
      create: {
        flagId: newCheckoutFlag.id,
        environmentId: productionEnv.id,
        percentage: 25, // 25% rollout in production
        constraints: {
          rules: [
            { field: 'country', operator: 'in', value: ['ID', 'SG', 'MY'] },
            { field: 'plan', operator: 'in', value: ['pro', 'enterprise'] },
          ],
        },
      },
    });
  }

  console.log('✅ Flag targets created');

  // Create sample experiment
  if (buttonColorFlag) {
    await prisma.experiment.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Button Color Experiment',
        flagId: buttonColorFlag.id,
        metrics: {
          primary: 'click_rate',
          secondary: ['conversion_rate', 'bounce_rate'],
        },
        status: 'RUNNING',
        startAt: new Date(),
      },
    });
  }

  console.log('✅ Experiment created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


