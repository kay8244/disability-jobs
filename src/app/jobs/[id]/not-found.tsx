import Link from 'next/link'

export default function JobNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div
        className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
        role="alert"
      >
        <svg
          className="w-12 h-12 mx-auto text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-red-600 mb-4">채용 공고를 찾을 수 없습니다.</p>
        <Link href="/" className="btn btn-primary">
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
