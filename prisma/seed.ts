import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding the database...');

  // Create or override the base MarketContext for March 31, 2026
  const marchContext = await prisma.marketContext.create({
    data: {
      inflation: 3.0,
      repoRate: 6.75,
      petrolPrice: 20.30,
      upcomingPetrolHike: 3.06,
      hikeEffectiveDate: new Date('2026-04-01T00:00:00Z'), // Takes effect tomorrow
    },
  });

  console.log(`✅ Default MarketContext seeded with ID: ${marchContext.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
