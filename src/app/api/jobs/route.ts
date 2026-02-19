import { NextRequest, NextResponse } from 'next/server'
import { getJobs } from '@/lib/jobs'
import { EmploymentType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const result = await getJobs({
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: Math.min(parseInt(searchParams.get('limit') || '20', 10), 100),
      sortField: searchParams.get('sortField') || 'updatedAt',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
      isRemoteAvailable: searchParams.get('isRemoteAvailable') === 'true' || undefined,
      category: searchParams.get('category') || undefined,
      employmentType: (searchParams.get('employmentType') as EmploymentType) || undefined,
      salaryType: searchParams.get('salaryType') || undefined,
      city: searchParams.get('city') || undefined,
      district: searchParams.get('district') || undefined,
      query: searchParams.get('query') || undefined,
      userLat: searchParams.get('userLat') ? parseFloat(searchParams.get('userLat')!) : undefined,
      userLng: searchParams.get('userLng') ? parseFloat(searchParams.get('userLng')!) : undefined,
      maxDistance: searchParams.get('maxDistance') ? parseFloat(searchParams.get('maxDistance')!) : undefined,
      envStandWalk: searchParams.get('envStandWalk') || undefined,
      envLiftPower: searchParams.get('envLiftPower') || undefined,
      envHandwork: searchParams.get('envHandwork') || undefined,
      envEyesight: searchParams.get('envEyesight') || undefined,
      envBothHands: searchParams.get('envBothHands') || undefined,
      envListenTalk: searchParams.get('envListenTalk') || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
