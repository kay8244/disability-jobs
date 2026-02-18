import { EmploymentType, JobStatus } from '@/types'

export const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: '정규직',
  CONTRACT: '계약직',
  PART_TIME: '파트타임',
  INTERNSHIP: '인턴',
  TEMPORARY: '임시직',
  OTHER: '기타',
}

export const statusLabels: Record<JobStatus, string> = {
  ACTIVE: '모집중',
  CLOSED: '마감',
  EXPIRED: '기간만료',
}
