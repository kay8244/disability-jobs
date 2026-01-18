'use client'

import { useState, useEffect, useCallback } from 'react'
import JobCard from '@/components/JobCard'
import JobFilters from '@/components/JobFilters'
import Pagination from '@/components/Pagination'
import MapView from '@/components/MapView'
import { JobWithCompany, JobListResponse, EmploymentType, MapMarker } from '@/types'
import clsx from 'clsx'

interface FilterState {
  maxDistance?: number
  isRemoteAvailable: boolean
  category?: string
  employmentType?: EmploymentType
  city?: string
  sortField: string
  sortOrder: 'asc' | 'desc'
}

export default function HomePage() {
  // State
  const [jobs, setJobs] = useState<JobWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    isRemoteAvailable: false,
    sortField: 'updatedAt',
    sortOrder: 'desc',
  })

  // Available filter options
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableEmploymentTypes, setAvailableEmploymentTypes] = useState<EmploymentType[]>([])

  // Location state
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)

  // Map toggle state
  const [showMap, setShowMap] = useState(false)

  // Auto-request location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLocationEnabled(true)
          // Change to distance sort when location is available
          setFilters(prev => ({
            ...prev,
            sortField: 'distance',
            sortOrder: 'asc',
          }))
        },
        (error) => {
          console.log('Geolocation not available or denied:', error.message)
        },
        { timeout: 10000, maximumAge: 300000 }
      )
    }
  }, [])

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
      })

      if (filters.isRemoteAvailable) {
        params.set('isRemoteAvailable', 'true')
      }
      if (filters.category) {
        params.set('category', filters.category)
      }
      if (filters.employmentType) {
        params.set('employmentType', filters.employmentType)
      }
      if (filters.city) {
        params.set('city', filters.city)
      }
      if (userLocation) {
        params.set('userLat', userLocation.lat.toString())
        params.set('userLng', userLocation.lng.toString())
        if (filters.maxDistance) {
          params.set('maxDistance', filters.maxDistance.toString())
        }
      }

      const response = await fetch(`/api/jobs?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data: JobListResponse = await response.json()

      setJobs(data.jobs)
      setTotalPages(data.pagination.totalPages)
      setTotalJobs(data.pagination.total)
      setAvailableCategories(data.filters.categories)
      setAvailableCities(data.filters.cities)
      setAvailableEmploymentTypes(data.filters.employmentTypes)
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [page, filters, userLocation])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Handle location request
  const handleRequestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLocationEnabled(true)
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Show message to user
          alert(
            '위치 정보를 가져올 수 없습니다. 브라우저 설정에서 위치 권한을 확인해주세요.'
          )
        }
      )
    } else {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.')
    }
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  // Handle job card click
  const handleJobSelect = (job: JobWithCompany) => {
    window.location.href = `/jobs/${job.id}`
  }

  // Handle map marker click
  const handleMarkerClick = (jobId: string) => {
    window.location.href = `/jobs/${jobId}`
  }

  // Convert jobs to map markers
  const mapMarkers: MapMarker[] = jobs
    .filter((job) => job.company.latitude && job.company.longitude)
    .map((job) => ({
      id: job.id,
      lat: job.company.latitude!,
      lng: job.company.longitude!,
      title: job.title,
      company: job.company.name,
    }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">채용 공고</h1>
        <p className="text-gray-600 mt-1">
          장애인 고용 기업의 채용 정보를 확인하세요
        </p>
      </div>

      {/* Filters and map toggle */}
      <div className="mb-6 space-y-4">
        <JobFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableCategories={availableCategories}
          availableCities={availableCities}
          availableEmploymentTypes={availableEmploymentTypes}
          isLocationEnabled={isLocationEnabled}
          onRequestLocation={handleRequestLocation}
        />

        {/* Map toggle */}
        <div className="flex items-center justify-between">
          <p
            className="text-sm text-gray-600"
            aria-live="polite"
          >
            총 <strong>{totalJobs}</strong>개의 채용 공고
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">지도 보기</span>
            <button
              onClick={() => setShowMap(!showMap)}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                showMap ? 'bg-primary-600' : 'bg-gray-200'
              )}
              role="switch"
              aria-checked={showMap}
              aria-label="지도 보기 토글"
            >
              <span
                className={clsx(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  showMap ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className={clsx('flex gap-6', showMap && 'flex-col lg:flex-row')}>
        {/* Job list */}
        <div className={clsx('flex-1', showMap && 'lg:w-1/2')}>
          {loading ? (
            <div
              className="flex items-center justify-center py-12"
              role="status"
              aria-label="채용 공고 로딩 중"
            >
              <svg
                className="w-8 h-8 animate-spin text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="ml-2 text-gray-600">불러오는 중...</span>
            </div>
          ) : error ? (
            <div
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
              role="alert"
            >
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchJobs}
                className="btn btn-secondary mt-2"
              >
                다시 시도
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500">
                조건에 맞는 채용 공고가 없습니다.
              </p>
              <button
                onClick={() =>
                  handleFiltersChange({
                    isRemoteAvailable: false,
                    sortField: 'updatedAt',
                    sortOrder: 'desc',
                  })
                }
                className="btn btn-secondary mt-4"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <>
              {/* Job cards grid */}
              <div
                className="grid gap-4 md:grid-cols-2"
                role="list"
                aria-label="채용 공고 목록"
              >
                {jobs.map((job) => (
                  <div key={job.id} role="listitem">
                    <JobCard job={job} onSelect={handleJobSelect} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>

        {/* Map panel */}
        {showMap && (
          <div
            className={clsx(
              'bg-white rounded-lg border border-gray-200 overflow-hidden',
              'h-[400px] lg:h-[600px] lg:w-1/2 lg:sticky lg:top-24'
            )}
          >
            <MapView
              markers={mapMarkers}
              center={userLocation || undefined}
              userLocation={userLocation}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        )}
      </div>
    </div>
  )
}
