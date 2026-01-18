# 장애인 채용정보 플랫폼 (MVP)

장애인 고용 기업의 채용 정보를 제공하는 웹 서비스입니다.
공공데이터포털(data.go.kr) API에서 데이터를 수집하여 사용자 친화적인 인터페이스로 제공합니다.

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   PostgreSQL    │   Next.js App   │        Scheduler            │
│     (DB)        │ (Frontend + API)│   (node-cron)               │
│                 │                 │                             │
│  - companies    │  - React UI     │  - Daily sync               │
│  - jobs         │  - API Routes   │  - Geocoding retry          │
│  - sync_logs    │  - SSR          │                             │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                       │
         └────────┬────────┴───────────────────────┘
                  │
         ┌────────▼────────┐
         │  data.go.kr API │ (공공데이터)
         └─────────────────┘
```

## 폴더 구조

```
disability-jobs/
├── docker-compose.yml          # Docker 서비스 정의
├── Dockerfile                  # Next.js 앱 이미지
├── Dockerfile.scheduler        # 스케줄러 이미지
├── .env.example               # 환경변수 예시
├── package.json
├── prisma/
│   ├── schema.prisma          # DB 스키마
│   └── seed.ts                # 개발용 시드 데이터
└── src/
    ├── app/
    │   ├── layout.tsx         # 레이아웃 (헤더, 푸터)
    │   ├── page.tsx           # 메인 페이지 (채용 리스트)
    │   ├── globals.css        # 전역 스타일
    │   ├── api/
    │   │   ├── jobs/
    │   │   │   ├── route.ts   # GET /api/jobs
    │   │   │   └── [id]/route.ts  # GET /api/jobs/:id
    │   │   └── sync/route.ts  # POST /api/sync
    │   └── jobs/
    │       └── [id]/page.tsx  # 채용 상세 페이지
    ├── components/
    │   ├── JobCard.tsx        # 채용 카드 컴포넌트
    │   ├── JobFilters.tsx     # 필터 컴포넌트
    │   ├── MapView.tsx        # 지도 컴포넌트 (Leaflet)
    │   ├── MapViewClient.tsx  # 지도 클라이언트
    │   └── Pagination.tsx     # 페이지네이션
    ├── lib/
    │   ├── prisma.ts          # Prisma 클라이언트
    │   ├── data-go-kr.ts      # 공공데이터 API 클라이언트
    │   └── geocoding.ts       # 지오코딩 유틸리티
    ├── scheduler/
    │   ├── index.ts           # 스케줄러 엔트리포인트
    │   └── sync.ts            # 동기화 로직
    └── types/
        └── index.ts           # TypeScript 타입 정의
```

## DB 스키마

### Company (기업)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | Primary Key (CUID) |
| externalId | String? | 외부 API ID |
| name | String | 기업명 |
| address | String? | 주소 |
| city | String? | 시/도 |
| district | String? | 구/군 |
| latitude | Float? | 위도 |
| longitude | Float? | 경도 |
| geocodeStatus | Enum | 지오코딩 상태 |
| phone, email, website | String? | 연락처 |

### Job (채용공고)
| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | Primary Key |
| title | String | 채용 제목 |
| description | String? | 상세 설명 |
| category | String? | 직무 카테고리 |
| employmentType | Enum | 고용 형태 |
| isRemoteAvailable | Boolean | 재택 가능 여부 |
| deadline | DateTime? | 마감일 |
| application* | String? | 지원 방법 |
| companyId | String | FK → Company |

## 로컬 실행 방법

### 1. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 API 키를 설정합니다:

```env
# 필수
DATA_GO_KR_API_KEY=your_data_go_kr_api_key

# 선택 (지오코딩용 - 없으면 OSM Nominatim 사용)
KAKAO_REST_API_KEY=your_kakao_api_key
```

### 2. Docker로 실행

```bash
docker compose up --build
```

서비스 접속:
- **웹 앱**: http://localhost:3000
- **DB**: localhost:5432

### 3. 개발용 시드 데이터 삽입

별도 터미널에서:
```bash
docker compose exec app npx prisma db seed
```

### 4. 수동 데이터 동기화

```bash
curl -X POST http://localhost:3000/api/sync
```

## API 엔드포인트

### GET /api/jobs
채용 목록 조회

**Query Parameters:**
- `page` (number): 페이지 번호
- `limit` (number): 페이지당 개수 (max 100)
- `sortField` (string): 정렬 필드 (updatedAt, deadline, distance)
- `sortOrder` (string): asc | desc
- `isRemoteAvailable` (boolean): 재택 가능만
- `category` (string): 직무 카테고리
- `employmentType` (string): 고용 형태
- `city` (string): 시/도
- `maxDistance` (number): 최대 거리 (km)
- `userLat`, `userLng` (number): 사용자 위치

### GET /api/jobs/:id
채용 상세 조회

### GET /api/sync
동기화 상태 조회

### POST /api/sync
수동 동기화 실행

---

## 접근성(a11y) 체크리스트

이 프로젝트는 WCAG 2.1 가이드라인을 준수하여 개발되었습니다.

### 1. 키보드 접근성 ✅
- [x] 모든 인터랙티브 요소 Tab 키로 접근 가능
- [x] focus-visible 스타일로 현재 포커스 위치 명확히 표시
- [x] Skip link 제공 ("본문으로 바로가기")
- [x] 버튼, 링크에 Enter/Space 키 지원

**코드 적용:**
```css
/* globals.css */
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

### 2. 스크린리더 지원 ✅
- [x] 시맨틱 HTML 사용 (header, main, nav, article, section)
- [x] 적절한 heading 계층 구조 (h1 → h2)
- [x] ARIA 레이블 제공 (aria-label, aria-labelledby)
- [x] aria-live 영역으로 동적 콘텐츠 알림
- [x] 이미지/아이콘에 대체 텍스트 (aria-hidden 또는 sr-only)

**코드 적용:**
```tsx
// JobCard.tsx
<article
  role="button"
  aria-label={`${job.company.name} - ${job.title}`}
  tabIndex={0}
>
```

### 3. 색상 및 대비 ✅
- [x] 색상만으로 정보 전달하지 않음 (아이콘 + 텍스트 함께 사용)
- [x] WCAG AA 대비율 4.5:1 이상 준수
- [x] 고대비 모드 지원 (@media prefers-contrast)
- [x] 재택/마감 배지에 아이콘 함께 표시

**코드 적용:**
```tsx
// Badge with icon + text (not color only)
<span className="badge badge-remote">
  <svg>...</svg>  {/* Icon */}
  재택            {/* Text */}
</span>
```

### 4. 폼 접근성 ✅
- [x] 모든 입력 필드에 명시적 label 연결
- [x] 필수 필드 표시
- [x] 에러 메시지 명확히 전달

**코드 적용:**
```tsx
// JobFilters.tsx
<label htmlFor="city-select" className="form-label">
  지역
</label>
<select id="city-select" ...>
```

### 5. 터치 타겟 ✅
- [x] 최소 44x44px 터치 영역 확보
- [x] 버튼 간 적절한 간격

**코드 적용:**
```css
button, a, input, select, textarea {
  min-height: 44px;
  min-width: 44px;
}
```

### 6. 움직임 제어 ✅
- [x] prefers-reduced-motion 미디어쿼리 지원
- [x] 애니메이션 최소화

**코드 적용:**
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

### 7. 지도 접근성 ✅
- [x] 지도는 보조 수단으로만 제공 (토글로 선택)
- [x] 지도 없이도 모든 기능 사용 가능
- [x] 지도 영역에 스크린리더용 설명 제공

---

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 15, Prisma ORM
- **Map**: Leaflet + OpenStreetMap
- **Scheduler**: node-cron
- **Container**: Docker, Docker Compose

## 향후 개선사항 (Phase 2)

1. 자체 지원서 작성/제출 기능
2. 사용자 계정 및 북마크
3. 이메일/SMS 알림
4. 관리자 대시보드
5. 더 많은 공공데이터 소스 연동

## 라이선스

MIT License
