import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { marketRateService } from '@/lib/services/market-rates';

// Standard Prisma client instantiation
const prisma = new PrismaClient();

/**
 * GET triggered by Vercel Weekly Cron Job
 * Route: /api/cron/sync-market
 */
export async function GET(request: Request) {
  try {
    // 1. Authorization check
    // Ensure only our cron infrastructure possesses the secret token
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Fetch Active Market Context
    const currentContext = await prisma.marketContext.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!currentContext) {
      return new Response('No market context found in database to calculate against.', { status: 404 });
    }

    // 3. Resolve Updates via Service Layer (Mock/Real Pattern)
    const updates = await marketRateService.syncRates(currentContext);

    // 4. Create New Row in Database (This builds our historical economy graph!)
    const newlyInsertedContext = await prisma.marketContext.create({
      data: {
        repoRate: updates.repoRate ?? currentContext.repoRate,
        inflation: updates.inflation ?? currentContext.inflation,
        petrolPrice: updates.petrolPrice ?? currentContext.petrolPrice,
        upcomingPetrolHike: updates.upcomingPetrolHike !== undefined ? updates.upcomingPetrolHike : currentContext.upcomingPetrolHike,
        hikeEffectiveDate: updates.hikeEffectiveDate !== undefined ? updates.hikeEffectiveDate : currentContext.hikeEffectiveDate,
        projectedSpike: updates.projectedSpike !== undefined ? updates.projectedSpike : currentContext.projectedSpike,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Market Core successfully synchronized.',
      context: newlyInsertedContext 
    });
  } catch (error) {
    console.error('Market Service Synchronization Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  } finally {
    // Optional disconnect depending on Next.js patterns, usually omitted in Serverless,
    // but good to enforce here if running heavily.
    await prisma.$disconnect();
  }
}
