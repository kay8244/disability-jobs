'use client'

import { useState, useMemo } from 'react'
import { JobWithCompany } from '@/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { employmentTypeLabels, statusLabels, workEnvironmentLabels } from '@/lib/constants'
import { WorkEnvironment } from '@/types'
import MapView from '@/components/MapView'
import clsx from 'clsx'

interface JobDetailClientProps {
  job: JobWithCompany
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
  const [showMap, setShowMap] = useState(false)

  const hasLocation = job.company.latitude && job.company.longitude

  const mapMarkers = useMemo(() => hasLocation ? [{
    id: job.id,
    lat: job.company.latitude!,
    lng: job.company.longitude!,
    title: job.title,
    company: job.company.name,
  }] : [], [hasLocation, job.id, job.company.latitude, job.company.longitude, job.title, job.company.name])

  const mapCenter = useMemo(() => hasLocation ? {
    lat: job.company.latitude!,
    lng: job.company.longitude!,
  } : undefined, [hasLocation, job.company.latitude, job.company.longitude])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <nav className="mb-6" aria-label="브레드크럼">
        <a
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 rounded"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로 돌아가기
        </a>
      </nav>

      {/* Job header */}
      <header className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {job.title}
            </h1>
            <p className="text-xl text-gray-700">{job.company.name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={clsx(
                'badge',
                job.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              )}
            >
              {statusLabels[job.status]}
            </span>
            {job.isRemoteAvailable && (
              <span className="badge badge-remote">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                재택근무 가능
              </span>
            )}
          </div>
        </div>

        {/* Quick info */}
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">고용 형태</dt>
            <dd className="font-medium text-gray-900">
              {employmentTypeLabels[job.employmentType]}
            </dd>
          </div>
          {job.category && (
            <div>
              <dt className="text-gray-500">직무</dt>
              <dd className="font-medium text-gray-900">{job.category}</dd>
            </div>
          )}
          {job.salary && (
            <div>
              <dt className="text-gray-500">급여</dt>
              <dd className="font-medium text-gray-900">
                {job.salaryType ? `${job.salaryType} ` : ''}{job.salary}
              </dd>
            </div>
          )}
          {job.deadline && (
            <div>
              <dt className="text-gray-500">마감일</dt>
              <dd className="font-medium text-gray-900">
                {format(new Date(job.deadline), 'yyyy년 M월 d일', { locale: ko })}
              </dd>
            </div>
          )}
        </dl>
      </header>

      {/* Job description */}
      {job.description && (
        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            채용 상세 정보
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
          </div>
        </section>
      )}

      {/* Work environment */}
      {job.workEnvironment && (() => {
        const env = job.workEnvironment as WorkEnvironment
        const entries = Object.entries(env).filter(([, v]) => v)
        if (entries.length === 0) return null
        return (
          <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">작업환경</h2>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {entries.map(([key, value]) => (
                <div key={key}>
                  <dt className="text-gray-500">{workEnvironmentLabels[key] || key}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )
      })()}

      {/* Company info & location */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기업 정보</h2>

        <dl className="space-y-3">
          <div className="flex items-start gap-3">
            <dt className="sr-only">회사명</dt>
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <dd className="text-gray-700">{job.company.name}</dd>
          </div>

          {job.company.address && (
            <div className="flex items-start gap-3">
              <dt className="sr-only">주소</dt>
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
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
              <dd className="text-gray-700">{job.company.address}</dd>
            </div>
          )}

          {job.company.website && (
            <div className="flex items-start gap-3">
              <dt className="sr-only">웹사이트</dt>
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <dd>
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  {job.company.website}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {/* Map toggle */}
        {hasLocation && (
          <div className="mt-6">
            <button
              onClick={() => setShowMap(!showMap)}
              className="btn btn-secondary"
              aria-expanded={showMap}
              aria-controls="company-map"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              {showMap ? '지도 숨기기' : '지도 보기'}
            </button>

            {showMap && (
              <div
                id="company-map"
                className="mt-4 h-[300px] rounded-lg overflow-hidden border border-gray-200"
              >
                <MapView
                  markers={mapMarkers}
                  center={mapCenter}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Apply section */}
      <section
        className="bg-white rounded-lg border border-gray-200 p-6"
        aria-labelledby="apply-heading"
      >
        <h2
          id="apply-heading"
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          지원하기
        </h2>

        {/* Application method description */}
        {job.applicationMethod && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">지원 방법: </span>
              {job.applicationMethod}
            </p>
          </div>
        )}

        {/* Contact info with visible details */}
        <div className="space-y-3 mb-4">
          {job.applicationPhone && (
            <div className="flex items-center gap-3 text-gray-700">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
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
              <span className="font-medium">{job.applicationPhone}</span>
            </div>
          )}
          {job.applicationEmail && (
            <div className="flex items-center gap-3 text-gray-700">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
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
              <span className="font-medium">{job.applicationEmail}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {job.applicationPhone && (
            <a
              href={`tel:${job.applicationPhone}`}
              className="btn btn-outline flex-1 min-w-[140px] justify-center"
              aria-label={`전화로 지원하기: ${job.applicationPhone}`}
            >
              <svg
                className="w-5 h-5 mr-2"
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
              전화 문의
            </a>
          )}

          {job.applicationEmail && (
            <a
              href={`mailto:${job.applicationEmail}?subject=[지원문의] ${job.title}`}
              className="btn btn-outline flex-1 min-w-[140px] justify-center"
              aria-label={`이메일로 지원하기: ${job.applicationEmail}`}
            >
              <svg
                className="w-5 h-5 mr-2"
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
              이메일 문의
            </a>
          )}

          {job.applicationUrl && (
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary flex-1 min-w-[140px] justify-center"
              aria-label="외부 채용 페이지에서 지원하기 (새 창에서 열림)"
            >
              외부 페이지에서 지원
              <svg
                className="w-5 h-5 ml-2"
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

        {!job.applicationPhone &&
          !job.applicationEmail &&
          !job.applicationUrl && (
            <p className="text-gray-500 text-center py-4">
              지원 방법 정보가 없습니다. 기업에 직접 문의해주세요.
            </p>
          )}
      </section>

      {/* Last updated */}
      <p className="text-sm text-gray-500 text-center mt-6">
        마지막 업데이트:{' '}
        {format(new Date(job.updatedAt), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
      </p>
    </div>
  )
}
