'use client'

import { useState } from 'react'
import { EmploymentType } from '@/types'
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

interface JobFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableCategories: string[]
  availableCities: string[]
  availableEmploymentTypes: EmploymentType[]
  isLocationEnabled: boolean
  onRequestLocation: () => void
}

const distanceOptions = [
  { value: undefined, label: '전체' },
  { value: 1, label: '1km 이내' },
  { value: 3, label: '3km 이내' },
  { value: 5, label: '5km 이내' },
  { value: 10, label: '10km 이내' },
  { value: 20, label: '20km 이내' },
]

const sortOptions = [
  { field: 'updatedAt', order: 'desc' as const, label: '최신순' },
  { field: 'deadline', order: 'asc' as const, label: '마감임박순' },
  { field: 'distance', order: 'asc' as const, label: '거리순' },
]

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: '정규직',
  CONTRACT: '계약직',
  PART_TIME: '파트타임',
  INTERNSHIP: '인턴',
  TEMPORARY: '임시직',
  OTHER: '기타',
}

export default function JobFilters({
  filters,
  onFiltersChange,
  availableCategories,
  availableCities,
  availableEmploymentTypes,
  isLocationEnabled,
  onRequestLocation,
}: JobFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleSortChange = (value: string) => {
    const option = sortOptions.find(
      (opt) => `${opt.field}-${opt.order}` === value
    )
    if (option) {
      onFiltersChange({
        ...filters,
        sortField: option.field,
        sortOrder: option.order,
      })
    }
  }

  const clearFilters = () => {
    onFiltersChange({
      maxDistance: undefined,
      isRemoteAvailable: false,
      category: undefined,
      employmentType: undefined,
      city: undefined,
      sortField: 'updatedAt',
      sortOrder: 'desc',
    })
  }

  const activeFilterCount = [
    filters.maxDistance,
    filters.isRemoteAvailable,
    filters.category,
    filters.employmentType,
    filters.city,
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Filter header with expand/collapse */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 rounded"
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          필터
          {activeFilterCount > 0 && (
            <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
              {activeFilterCount}
            </span>
          )}
          <svg
            className={clsx(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Sort dropdown - always visible */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="sr-only">
            정렬 기준
          </label>
          <select
            id="sort-select"
            value={`${filters.sortField}-${filters.sortOrder}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className="form-input text-sm py-1"
          >
            {sortOptions.map((option) => (
              <option
                key={`${option.field}-${option.order}`}
                value={`${option.field}-${option.order}`}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expandable filter panel */}
      <div
        id="filter-panel"
        className={clsx(
          'grid gap-4 mt-4 transition-all',
          isExpanded ? 'block' : 'hidden'
        )}
        role="region"
        aria-label="검색 필터"
      >
        {/* Location-based filters */}
        <div className="form-field">
          <label htmlFor="distance-select" className="form-label">
            거리
          </label>
          {!isLocationEnabled ? (
            <button
              onClick={onRequestLocation}
              className="btn btn-secondary text-sm"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              내 위치 사용
            </button>
          ) : (
            <select
              id="distance-select"
              value={filters.maxDistance ?? ''}
              onChange={(e) =>
                updateFilter(
                  'maxDistance',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="form-input"
            >
              {distanceOptions.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Remote work toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="remote-toggle"
            checked={filters.isRemoteAvailable}
            onChange={(e) =>
              updateFilter('isRemoteAvailable', e.target.checked)
            }
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="remote-toggle" className="text-gray-700">
            재택근무 가능만 보기
          </label>
        </div>

        {/* City filter */}
        {availableCities.length > 0 && (
          <div className="form-field">
            <label htmlFor="city-select" className="form-label">
              지역
            </label>
            <select
              id="city-select"
              value={filters.city ?? ''}
              onChange={(e) =>
                updateFilter('city', e.target.value || undefined)
              }
              className="form-input"
            >
              <option value="">전체 지역</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category filter */}
        {availableCategories.length > 0 && (
          <div className="form-field">
            <label htmlFor="category-select" className="form-label">
              직무 카테고리
            </label>
            <select
              id="category-select"
              value={filters.category ?? ''}
              onChange={(e) =>
                updateFilter('category', e.target.value || undefined)
              }
              className="form-input"
            >
              <option value="">전체 직무</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Employment type filter */}
        {availableEmploymentTypes.length > 0 && (
          <div className="form-field">
            <label htmlFor="employment-type-select" className="form-label">
              고용 형태
            </label>
            <select
              id="employment-type-select"
              value={filters.employmentType ?? ''}
              onChange={(e) =>
                updateFilter(
                  'employmentType',
                  (e.target.value as EmploymentType) || undefined
                )
              }
              className="form-input"
            >
              <option value="">전체</option>
              {availableEmploymentTypes.map((type) => (
                <option key={type} value={type}>
                  {employmentTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear filters button */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="btn btn-secondary text-sm justify-center"
          >
            필터 초기화
          </button>
        )}
      </div>
    </div>
  )
}
