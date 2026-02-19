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

export const workEnvironmentLabels: Record<string, string> = {
  bothHands: '양손 작업',
  eyesight: '시력',
  handwork: '수작업',
  liftPower: '들기 힘',
  listenTalk: '듣기/말하기',
  standWalk: '서기/걷기',
}
