import { prisma } from '../lib/prisma'
import { DataGoKrClient, normalizeJobData, RawJobData } from '../lib/data-go-kr'
import { geocodeAddress, parseKoreanAddress } from '../lib/geocoding'
import { GeoCodeStatus, SyncStatus } from '@prisma/client'

/**
 * Main sync function that fetches data from data.go.kr and updates the database
 */
export async function syncJobsFromDataGoKr(): Promise<{
  success: boolean
  stats: {
    total: number
    created: number
    updated: number
    failed: number
  }
  error?: string
}> {
  const stats = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
  }

  // Create sync log entry
  const syncLog = await prisma.syncLog.create({
    data: {
      source: 'data.go.kr',
      status: SyncStatus.RUNNING,
    },
  })

  try {
    console.log('Starting data sync from data.go.kr...')

    const client = new DataGoKrClient()
    const rawJobs = await client.fetchAllJobs()
    stats.total = rawJobs.length

    console.log(`Fetched ${rawJobs.length} job listings`)

    // Process each job
    for (const rawJob of rawJobs) {
      try {
        await processJobData(rawJob, stats)
      } catch (error) {
        console.error('Failed to process job:', error)
        stats.failed++
      }

      // Rate limiting for geocoding
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: SyncStatus.COMPLETED,
        recordsTotal: stats.total,
        recordsCreated: stats.created,
        recordsUpdated: stats.updated,
        recordsFailed: stats.failed,
        completedAt: new Date(),
      },
    })

    console.log('Sync completed:', stats)
    return { success: true, stats }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: SyncStatus.FAILED,
        errorMessage,
        completedAt: new Date(),
      },
    })

    console.error('Sync failed:', errorMessage)
    return { success: false, stats, error: errorMessage }
  }
}

/**
 * Process a single job data entry
 */
async function processJobData(
  rawJob: RawJobData,
  stats: { created: number; updated: number; failed: number }
): Promise<void> {
  const normalized = normalizeJobData(rawJob)

  // Find or create company
  let company = normalized.company.externalId
    ? await prisma.company.findUnique({
        where: { externalId: normalized.company.externalId },
      })
    : null

  if (!company) {
    // Parse address for city/district
    const addressParts = normalized.company.address
      ? parseKoreanAddress(normalized.company.address)
      : { city: null, district: null }

    company = await prisma.company.create({
      data: {
        externalId: normalized.company.externalId,
        name: normalized.company.name,
        address: normalized.company.address,
        city: addressParts.city,
        district: addressParts.district,
        phone: normalized.company.phone,
        email: normalized.company.email,
        website: normalized.company.website,
        geocodeStatus: GeoCodeStatus.PENDING,
      },
    })

    // Geocode the address
    if (normalized.company.address) {
      await geocodeCompany(company.id, normalized.company.address)
    }
  }

  // Find or create job
  const existingJob = normalized.job.externalId
    ? await prisma.job.findUnique({
        where: { externalId: normalized.job.externalId },
      })
    : null

  if (existingJob) {
    // Update existing job
    await prisma.job.update({
      where: { id: existingJob.id },
      data: {
        title: normalized.job.title,
        description: normalized.job.description,
        category: normalized.job.category,
        employmentType: normalized.job.employmentType,
        salary: normalized.job.salary,
        isRemoteAvailable: normalized.job.isRemoteAvailable,
        workLocation: normalized.job.workLocation,
        deadline: normalized.job.deadline,
        applicationUrl: normalized.job.applicationUrl,
        applicationEmail: normalized.job.applicationEmail,
        applicationPhone: normalized.job.applicationPhone,
      },
    })
    stats.updated++
  } else {
    // Create new job
    await prisma.job.create({
      data: {
        externalId: normalized.job.externalId,
        title: normalized.job.title,
        description: normalized.job.description,
        category: normalized.job.category,
        employmentType: normalized.job.employmentType,
        salary: normalized.job.salary,
        isRemoteAvailable: normalized.job.isRemoteAvailable,
        workLocation: normalized.job.workLocation,
        deadline: normalized.job.deadline,
        applicationUrl: normalized.job.applicationUrl,
        applicationEmail: normalized.job.applicationEmail,
        applicationPhone: normalized.job.applicationPhone,
        companyId: company.id,
      },
    })
    stats.created++
  }
}

/**
 * Geocode a company's address and update the database
 */
async function geocodeCompany(companyId: string, address: string): Promise<void> {
  try {
    const result = await geocodeAddress(address)

    if (result) {
      await prisma.company.update({
        where: { id: companyId },
        data: {
          latitude: result.latitude,
          longitude: result.longitude,
          geocodeStatus: GeoCodeStatus.SUCCESS,
        },
      })
    } else {
      await prisma.company.update({
        where: { id: companyId },
        data: {
          geocodeStatus: GeoCodeStatus.NOT_FOUND,
        },
      })
    }
  } catch (error) {
    console.error(`Geocoding failed for company ${companyId}:`, error)
    await prisma.company.update({
      where: { id: companyId },
      data: {
        geocodeStatus: GeoCodeStatus.FAILED,
      },
    })
  }
}

/**
 * Geocode all companies that are pending geocoding
 */
export async function geocodePendingCompanies(): Promise<number> {
  const pendingCompanies = await prisma.company.findMany({
    where: {
      geocodeStatus: GeoCodeStatus.PENDING,
      address: { not: null },
    },
    take: 100, // Limit to avoid rate limiting
  })

  let processed = 0

  for (const company of pendingCompanies) {
    if (company.address) {
      await geocodeCompany(company.id, company.address)
      processed++
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return processed
}

// Run sync if executed directly
if (require.main === module) {
  syncJobsFromDataGoKr()
    .then(result => {
      console.log('Sync result:', result)
      process.exit(result.success ? 0 : 1)
    })
    .catch(error => {
      console.error('Sync error:', error)
      process.exit(1)
    })
}
