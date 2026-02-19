'use client'

import { memo, useMemo, useCallback } from 'react'
import { JobWithCompany } from '@/types'
import { format, isPast, differenceInDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { employmentTypeLabels } from '@/lib/constants'
import clsx from 'clsx'

interface JobCardProps {
  job: JobWithCompany
  onSelect?: (job: JobWithCompany) => void
}

export default memo(function JobCard({ job, onSelect }: JobCardProps) {
  const { isExpired, daysUntilDeadline } = useMemo(() => ({
    isExpired: job.deadline ? isPast(new Date(job.deadline)) : false,
    daysUntilDeadline: job.deadline
      ? differenceInDays(new Date(job.deadline), new Date())
      : null,
  }), [job.deadline])

  const handleClick = useCallback(() => {
    onSelect?.(job)
  }, [onSelect, job])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.(job)
    }
  }, [onSelect, job])

  return (
    <article
      className={clsx(
        'card p-4 cursor-pointer',
        isExpired && 'opacity-60'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${job.company.name} - ${job.title}. ${
        isExpired ? '마감됨' : daysUntilDeadline !== null ? `마감 ${daysUntilDeadline}일 전` : ''
      }`}
    >
      {/* Header: Company name and badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
          {job.company.name}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {job.isRemoteAvailable && (
            <span
              className="badge badge-remote"
              aria-label="재택근무 가능"
            >
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              재택
            </span>
          )}
          {daysUntilDeadline !== null && daysUntilDeadline <= 7 && !isExpired && (
            <span
              className="badge badge-deadline"
              aria-label={`마감 ${daysUntilDeadline}일 전`}
            >
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              D-{daysUntilDeadline}
            </span>
          )}
          {isExpired && (
            <span className="badge bg-gray-200 text-gray-600">
              마감
            </span>
          )}
        </div>
      </div>

      {/* Job title */}
      <p className="text-gray-700 font-medium mb-3 line-clamp-2">
        {job.title}
      </p>

      {/* Job details */}
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {/* Address */}
        <div className="col-span-2">
          <dt className="sr-only">주소</dt>
          <dd className="flex items-center gap-1 text-gray-600">
            <svg
              className="w-4 h-4 flex-shrink-0"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="line-clamp-1">
              {job.company.address || '주소 정보 없음'}
            </span>
          </dd>
        </div>

        {/* Distance */}
        {job.distance !== undefined && (
          <div>
            <dt className="sr-only">거리</dt>
            <dd className="flex items-center gap-1 text-gray-600">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              {job.distance} km
            </dd>
          </div>
        )}

        {/* Employment type */}
        <div>
          <dt className="sr-only">고용 형태</dt>
          <dd className="text-gray-600">
            {employmentTypeLabels[job.employmentType]}
          </dd>
        </div>

        {/* Salary */}
        {job.salary && (
          <div>
            <dt className="sr-only">급여</dt>
            <dd className="text-gray-600">
              {job.salaryType ? `${job.salaryType} ` : ''}{job.salary}
            </dd>
          </div>
        )}

        {/* Deadline */}
        {job.deadline && (
          <div>
            <dt className="sr-only">마감일</dt>
            <dd className="text-gray-600">
              ~{format(new Date(job.deadline), 'M.d', { locale: ko })}
            </dd>
          </div>
        )}

        {/* Category */}
        {job.category && (
          <div>
            <dt className="sr-only">직무</dt>
            <dd className="text-gray-600 line-clamp-1">{job.category}</dd>
          </div>
        )}
      </dl>

      {/* Contact buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        {job.applicationPhone && (
          <a
            href={`tel:${job.applicationPhone}`}
            className="btn btn-outline text-sm py-1 px-3"
            onClick={(e) => e.stopPropagation()}
            aria-label={`${job.company.name}에 전화하기: ${job.applicationPhone}`}
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            전화
          </a>
        )}
        {job.applicationEmail && (
          <a
            href={`mailto:${job.applicationEmail}`}
            className="btn btn-outline text-sm py-1 px-3"
            onClick={(e) => e.stopPropagation()}
            aria-label={`${job.company.name}에 이메일 보내기`}
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            이메일
          </a>
        )}
        {job.applicationUrl && (
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary text-sm py-1 px-3 ml-auto"
            onClick={(e) => e.stopPropagation()}
            aria-label={`${job.company.name} 채용 페이지 열기 (새 창)`}
          >
            지원하기
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </article>
  )
})
