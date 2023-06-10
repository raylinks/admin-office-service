import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // create roles with permissions
  await prisma.role.upsert({
    where: { namw: 'OPERATION' },
    update: {},
    create: {
      namw: 'OPERATION',
    },
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
