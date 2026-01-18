import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/geocoding'
import { EmploymentType, JobStatus, Prisma } from '@prisma/client'
import { JobWithCompany, JobListResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const skip = (page - 1) * limit

    // Filters
    const maxDistance = searchParams.get('maxDistance')
      ? parseFloat(searchParams.get('maxDistance')!)
      : undefined
    const userLat = searchParams.get('userLat')
      ? parseFloat(searchParams.get('userLat')!)
      : undefined
    const userLng = searchParams.get('userLng')
      ? parseFloat(searchParams.get('userLng')!)
      : undefined
    const isRemoteAvailable = searchParams.get('isRemoteAvailable') === 'true'
    const category = searchParams.get('category') || undefined
    const employmentType = searchParams.get('employmentType') as EmploymentType | undefined
    const city = searchParams.get('city') || undefined
    const district = searchParams.get('district') || undefined
    const query = searchParams.get('query') || undefined

    // Sort
    const sortField = searchParams.get('sortField') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: Prisma.JobWhereInput = {
      status: JobStatus.ACTIVE,
    }

    if (isRemoteAvailable) {
      where.isRemoteAvailable = true
    }

    if (category) {
      where.category = category
    }

    if (employmentType) {
      where.employmentType = employmentType
    }

    if (city || district) {
      where.company = {
        ...(city && { city }),
        ...(district && { district }),
      }
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { company: { name: { contains: query, mode: 'insensitive' } } },
      ]
    }

    // Build orderBy clause
    let orderBy: Prisma.JobOrderByWithRelationInput = {}
    if (sortField === 'deadline') {
      orderBy = { deadline: sortOrder as Prisma.SortOrder }
    } else if (sortField === 'createdAt') {
      orderBy = { createdAt: sortOrder as Prisma.SortOrder }
    } else {
      orderBy = { updatedAt: sortOrder as Prisma.SortOrder }
    }

    // Fetch jobs with company info
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])

    // Calculate distance if user location is provided
    let jobsWithDistance: JobWithCompany[] = jobs.map(job => ({
      ...job,
      distance: undefined as number | undefined,
    }))

    if (userLat !== undefined && userLng !== undefined) {
      jobsWithDistance = jobs.map(job => {
        let distance: number | undefined
        if (job.company.latitude && job.company.longitude) {
          distance = calculateDistance(
            userLat,
            userLng,
            job.company.latitude,
            job.company.longitude
          )
        }
        return { ...job, distance }
      })

      // Filter by distance if maxDistance is specified
      if (maxDistance !== undefined) {
        jobsWithDistance = jobsWithDistance.filter(
          job => job.distance === undefined || job.distance <= maxDistance
        )
      }

      // Sort by distance if requested
      if (sortField === 'distance') {
        jobsWithDistance.sort((a, b) => {
          if (a.distance === undefined) return 1
          if (b.distance === undefined) return -1
          return sortOrder === 'asc'
            ? a.distance - b.distance
            : b.distance - a.distance
        })
      }
    }

    // Get filter options
    const [categories, cities, employmentTypes] = await Promise.all([
      prisma.job.findMany({
        where: { status: JobStatus.ACTIVE, category: { not: null } },
        select: { category: true },
        distinct: ['category'],
      }),
      prisma.company.findMany({
        where: { city: { not: null } },
        select: { city: true },
        distinct: ['city'],
      }),
      prisma.job.findMany({
        where: { status: JobStatus.ACTIVE },
        select: { employmentType: true },
        distinct: ['employmentType'],
      }),
    ])

    const response: JobListResponse = {
      jobs: jobsWithDistance,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        categories: categories
          .map(c => c.category)
          .filter((c): c is string => c !== null),
        cities: cities
          .map(c => c.city)
          .filter((c): c is string => c !== null),
        employmentTypes: employmentTypes.map(e => e.employmentType),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
