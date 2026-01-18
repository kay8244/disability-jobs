import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { JobDetailResponse } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { company: true },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const response: JobDetailResponse = {
      job: {
        ...job,
        distance: undefined,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}
