import { getJobs } from '@/lib/jobs'
import JobListClient from '@/components/JobListClient'

export default async function HomePage() {
  // Fetch initial data on the server
  const { jobs, pagination, filters } = await getJobs({
    page: 1,
    limit: 20,
    sortField: 'updatedAt',
    sortOrder: 'desc',
  })

  return (
    <JobListClient
      initialJobs={jobs}
      initialPagination={pagination}
      initialFilters={filters}
    />
  )
}
