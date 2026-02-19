import { Company, Job, EmploymentType, JobStatus, GeoCodeStatus } from '@prisma/client'

// Work environment requirements from API
export interface WorkEnvironment {
  bothHands?: string   // 양손 작업환경
  eyesight?: string    // 시력 작업환경
  handwork?: string    // 수작업 작업환경
  liftPower?: string   // 들기 작업환경
  listenTalk?: string  // 듣기/말하기 작업환경
  standWalk?: string   // 서기/걷기 작업환경
}

// Job with company information
export interface JobWithCompany extends Job {
  company: Company
  distance?: number // Calculated distance from user location
}

// Filter options for job list
export interface JobFilters {
  // Distance filter (in km)
  maxDistance?: number
  userLat?: number
  userLng?: number

  // Remote work filter
  isRemoteAvailable?: boolean

  // Category filter
  category?: string

  // Employment type filter
  employmentType?: EmploymentType

  // Location filter
  city?: string
  district?: string

  // Search query
  query?: string
}

// Sort options
export type JobSortField = 'distance' | 'deadline' | 'updatedAt' | 'createdAt'
export type SortOrder = 'asc' | 'desc'

export interface JobSort {
  field: JobSortField
  order: SortOrder
}

// Pagination
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// API response types
export interface JobListResponse {
  jobs: JobWithCompany[]
  pagination: Pagination
  filters: {
    categories: string[]
    cities: string[]
    employmentTypes: EmploymentType[]
  }
}

export interface JobDetailResponse {
  job: JobWithCompany
}

// Filter state for job list UI
export interface FilterState {
  maxDistance?: number
  isRemoteAvailable: boolean
  category?: string
  employmentType?: EmploymentType
  city?: string
  sortField: string
  sortOrder: 'asc' | 'desc'
}

// Map data for display
export interface MapMarker {
  id: string
  lat: number
  lng: number
  title: string
  company: string
}

export type {
  Company,
  Job,
  EmploymentType,
  JobStatus,
  GeoCodeStatus,
}
