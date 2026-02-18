import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '장애인 채용정보 - 일자리를 찾아보세요',
  description: '장애인 고용 기업의 채용 정보를 한눈에 확인하세요. 거리, 재택근무, 직무 등 다양한 조건으로 검색할 수 있습니다.',
  keywords: ['장애인', '채용', '구인', '구직', '일자리', '고용'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {/* Naver Maps SDK */}
        <Script
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}`}
          strategy="afterInteractive"
        />

        {/* Skip to main content link for keyboard users */}
        <a href="#main-content" className="skip-link">
          본문으로 바로가기
        </a>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a
                href="/"
                className="text-xl font-bold text-primary-600 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 rounded"
                aria-label="장애인 채용정보 홈으로 이동"
              >
                장애인 채용정보
              </a>
              <nav aria-label="주 메뉴">
                <ul className="flex items-center gap-4">
                  <li>
                    <a
                      href="/"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600"
                    >
                      채용공고
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                이 서비스는 공공데이터포털(data.go.kr)의 장애인 채용 정보를 활용합니다.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                문의사항이 있으시면 이메일로 연락해 주세요.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
