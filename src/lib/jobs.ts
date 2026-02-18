import { prisma } from '@/lib/prisma'
import { JobStatus, EmploymentType, Prisma } from '@prisma/client'
import { JobWithCompany } from '@/types'
import { calculateDistance } from '@/lib/geocoding'
import { cached, invalidateCache } from '@/lib/cache'

export interface GetJobsParams {
  page?: number
  limit?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  isRemoteAvailable?: boolean
  category?: string
  employmentType?: EmploymentType
  city?: string
  district?: string
  query?: string
  userLat?: number
  userLng?: number
  maxDistance?: number
}

export interface GetJobsResult {
  jobs: JobWithCompany[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    categories: string[]
    cities: string[]
    employmentTypes: EmploymentType[]
  }
}

export interface FilterOptions {
  categories: string[]
  cities: string[]
  employmentTypes: EmploymentType[]
}

const FILTER_CACHE_KEY = 'filter-options'
const FILTER_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get filter options with cross-request TTL caching.
 * Filter options (categories, cities, employment types) rarely change,
 * so we cache them for 5 minutes to avoid querying the DB on every request.
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  return cached(
    FILTER_CACHE_KEY,
    async () => {
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

      return {
        categories: categories
          .map((c) => c.category)
          .filter((c): c is string => c !== null),
        cities: cities
          .map((c) => c.city)
          .filter((c): c is string => c !== null),
        employmentTypes: employmentTypes.map((e) => e.employmentType),
      }
    },
    FILTER_CACHE_TTL
  )
}

/**
 * Invalidate the filter options cache.
 * Call this after data sync or when jobs/companies are updated.
 */
export function invalidateFilterCache(): void {
  invalidateCache(FILTER_CACHE_KEY)
}

export async function getJobs(params: GetJobsParams = {}): Promise<GetJobsResult> {
  const {
    page = 1,
    limit = 20,
    sortField = 'updatedAt',
    sortOrder = 'desc',
    isRemoteAvailable,
    category,
    employmentType,
    city,
    district,
    query,
    userLat,
    userLng,
    maxDistance,
  } = params

  const skip = (page - 1) * limit

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

  // Check if we need distance-based sorting
  const isDistanceSort =
    sortField === 'distance' && userLat !== undefined && userLng !== undefined

  // Build orderBy clause
  let orderBy: Prisma.JobOrderByWithRelationInput = {}
  if (sortField === 'deadline') {
    orderBy = { deadline: sortOrder as Prisma.SortOrder }
  } else if (sortField === 'createdAt') {
    orderBy = { createdAt: sortOrder as Prisma.SortOrder }
  } else if (!isDistanceSort) {
    orderBy = { updatedAt: sortOrder as Prisma.SortOrder }
  }

  let jobsWithDistance: JobWithCompany[]
  let total: number

  if (isDistanceSort) {
    // For distance sorting, fetch ALL jobs first, then sort and paginate
    const allJobs = await prisma.job.findMany({
      where,
      include: { company: true },
    })

    // Calculate distance for all jobs
    let allJobsWithDistance = allJobs.map((job) => {
      let distance: number | undefined
      if (job.company.latitude && job.company.longitude) {
        distance = calculateDistance(
          userLat!,
          userLng!,
          job.company.latitude,
          job.company.longitude
        )
      }
      return { ...job, distance }
    })

    // Filter by maxDistance if specified
    if (maxDistance !== undefined) {
      allJobsWithDistance = allJobsWithDistance.filter(
        (job) => job.distance === undefined || job.distance <= maxDistance
      )
    }

    // Sort by distance
    allJobsWithDistance.sort((a, b) => {
      if (a.distance === undefined) return 1
      if (b.distance === undefined) return -1
      return sortOrder === 'asc'
        ? a.distance - b.distance
        : b.distance - a.distance
    })

    total = allJobsWithDistance.length
    jobsWithDistance = allJobsWithDistance.slice(skip, skip + limit)
  } else {
    // Standard pagination for non-distance sorting
    const [jobs, count] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])

    total = count

    // Calculate distance if user location is provided (for display only)
    if (userLat !== undefined && userLng !== undefined) {
      jobsWithDistance = jobs.map((job) => {
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
    } else {
      jobsWithDistance = jobs.map((job) => ({
        ...job,
        distance: undefined as number | undefined,
      }))
    }
  }

  // Get filter options (cached per request)
  const filterOptions = await getFilterOptions()

  return {
    jobs: jobsWithDistance,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    filters: filterOptions,
  }
}

export async function getJobById(id: string): Promise<JobWithCompany | null> {
  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true },
  })

  if (!job) {
    return null
  }

  return {
    ...job,
    distance: undefined,
  }
}
