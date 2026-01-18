import { NextRequest, NextResponse } from 'next/server'
import { syncJobsFromDataGoKr } from '@/scheduler/sync'

/**
 * Manual sync trigger endpoint
 * POST /api/sync
 *
 * This endpoint can be used to manually trigger a data sync.
 * In production, you might want to protect this with authentication.
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.SYNC_API_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    console.log('Manual sync triggered via API')

    const result = await syncJobsFromDataGoKr()

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Sync completed successfully' : 'Sync failed',
      stats: result.stats,
      error: result.error,
    })
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger sync' },
      { status: 500 }
    )
  }
}

/**
 * Get sync status
 * GET /api/sync
 */
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma')

    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { startedAt: 'desc' },
    })

    const stats = await prisma.syncLog.aggregate({
      _sum: {
        recordsCreated: true,
        recordsUpdated: true,
      },
    })

    const jobCount = await prisma.job.count()
    const companyCount = await prisma.company.count()

    return NextResponse.json({
      lastSync: lastSync
        ? {
            status: lastSync.status,
            startedAt: lastSync.startedAt,
            completedAt: lastSync.completedAt,
            recordsTotal: lastSync.recordsTotal,
            recordsCreated: lastSync.recordsCreated,
            recordsUpdated: lastSync.recordsUpdated,
            recordsFailed: lastSync.recordsFailed,
          }
        : null,
      totals: {
        jobs: jobCount,
        companies: companyCount,
        totalCreated: stats._sum.recordsCreated || 0,
        totalUpdated: stats._sum.recordsUpdated || 0,
      },
    })
  } catch (error) {
    console.error('Failed to get sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}
