import { notFound } from 'next/navigation'
import { getJobById } from '@/lib/jobs'
import JobDetailClient from '@/components/JobDetailClient'

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job) {
    notFound()
  }

  return <JobDetailClient job={job} />
}
