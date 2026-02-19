'use client'

import { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { FilterState, EmploymentType } from '@/types'
import { employmentTypeLabels, workEnvironmentLabels } from '@/lib/constants'
import clsx from 'clsx'

interface JobFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableCategories: string[]
  availableCities: string[]
  availableEmploymentTypes: EmploymentType[]
  availableSalaryTypes: string[]
  availableWorkEnvironmentOptions: Record<string, string[]>
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

// Map work environment filter keys to FilterState keys
const envFilterKeyMap: Record<string, keyof FilterState> = {
  standWalk: 'envStandWalk',
  liftPower: 'envLiftPower',
  handwork: 'envHandwork',
  eyesight: 'envEyesight',
  bothHands: 'envBothHands',
  listenTalk: 'envListenTalk',
}

export default memo(function JobFilters({
  filters,
  onFiltersChange,
  availableCategories,
  availableCities,
  availableEmploymentTypes,
  availableSalaryTypes,
  availableWorkEnvironmentOptions,
  isLocationEnabled,
  onRequestLocation,
}: JobFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.query ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Sync search input when filters.query is cleared externally
  useEffect(() => {
    if (!filters.query && searchInput) {
      setSearchInput('')
    }
  }, [filters.query]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, query: value || undefined })
    }, 300)
  }, [filters, onFiltersChange])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }, [filters, onFiltersChange])

  const handleSortChange = useCallback((value: string) => {
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
  }, [filters, onFiltersChange])

  const clearFilters = useCallback(() => {
    setSearchInput('')
    onFiltersChange({
      query: undefined,
      maxDistance: undefined,
      isRemoteAvailable: false,
      category: undefined,
      employmentType: undefined,
      salaryType: undefined,
      city: undefined,
      envStandWalk: undefined,
      envLiftPower: undefined,
      envHandwork: undefined,
      envEyesight: undefined,
      envBothHands: undefined,
      envListenTalk: undefined,
      sortField: 'updatedAt',
      sortOrder: 'desc',
    })
  }, [onFiltersChange])

  const activeFilterCount = useMemo(() => [
    filters.query,
    filters.maxDistance,
    filters.isRemoteAvailable,
    filters.category,
    filters.employmentType,
    filters.salaryType,
    filters.city,
    filters.envStandWalk,
    filters.envLiftPower,
    filters.envHandwork,
    filters.envEyesight,
    filters.envBothHands,
    filters.envListenTalk,
  ].filter(Boolean).length, [
    filters.query,
    filters.maxDistance,
    filters.isRemoteAvailable,
    filters.category,
    filters.employmentType,
    filters.salaryType,
    filters.city,
    filters.envStandWalk,
    filters.envLiftPower,
    filters.envHandwork,
    filters.envEyesight,
    filters.envBothHands,
    filters.envListenTalk,
  ])

  const hasWorkEnvOptions = Object.keys(availableWorkEnvironmentOptions).length > 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="회사명, 직무, 지역 검색..."
          aria-label="채용 공고 검색"
          className="form-input w-full pl-10"
        />
      </div>

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

        {/* Salary type filter */}
        {availableSalaryTypes.length > 0 && (
          <div className="form-field">
            <label htmlFor="salary-type-select" className="form-label">
              임금 형태
            </label>
            <select
              id="salary-type-select"
              value={filters.salaryType ?? ''}
              onChange={(e) =>
                updateFilter('salaryType', e.target.value || undefined)
              }
              className="form-input"
            >
              <option value="">전체</option>
              {availableSalaryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Work environment filters */}
        {hasWorkEnvOptions && (
          <fieldset className="border-t border-gray-200 pt-4">
            <legend className="form-label text-base font-semibold text-gray-800 mb-3">
              작업환경
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(availableWorkEnvironmentOptions).map(([key, values]) => {
                const filterKey = envFilterKeyMap[key]
                if (!filterKey) return null
                return (
                  <div key={key} className="form-field">
                    <label htmlFor={`env-${key}-select`} className="form-label">
                      {workEnvironmentLabels[key] || key}
                    </label>
                    <select
                      id={`env-${key}-select`}
                      value={(filters[filterKey] as string) ?? ''}
                      onChange={(e) =>
                        updateFilter(filterKey, e.target.value || undefined)
                      }
                      className="form-input text-sm"
                    >
                      <option value="">전체</option>
                      {values.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          </fieldset>
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
})
