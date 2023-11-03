import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  await prisma.role.upsert({
    where: { name: 'OPERATION' },
    update: {},
    create: {
      name: 'OPERATION',
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
