// scripts/initialize-points.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting script to initialize user points...');

  // Find users where points is null OR doesn't exist.
  // Note: Prisma doesn't directly translate $exists well for updates,
  // filtering for null often catches both cases in practice with MongoDB.
  // A raw query might be needed for perfect $exists targeting if null check isn't enough.
  const result = await prisma.user.updateMany({
    data: {
      matches: 0,
    },
  });

  console.log(`Initialization complete. Updated ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error('Error during point initialization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });