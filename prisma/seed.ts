import { PrismaClient, EmploymentType, JobStatus, GeoCodeStatus } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed script for development/testing
 * Creates sample companies and job listings
 */
async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.job.deleteMany()
  await prisma.company.deleteMany()
  await prisma.syncLog.deleteMany()

  // Sample companies with Korean addresses
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: '(주)희망기업',
        address: '서울특별시 강남구 테헤란로 123',
        city: '서울특별시',
        district: '강남구',
        latitude: 37.5012,
        longitude: 127.0396,
        geocodeStatus: GeoCodeStatus.SUCCESS,
        phone: '02-1234-5678',
        email: 'hr@hopebiz.co.kr',
        website: 'https://www.hopebiz.co.kr',
      },
    }),
    prisma.company.create({
      data: {
        name: '함께일하는사회적협동조합',
        address: '서울특별시 마포구 월드컵북로 396',
        city: '서울특별시',
        district: '마포구',
        latitude: 37.5562,
        longitude: 126.9085,
        geocodeStatus: GeoCodeStatus.SUCCESS,
        phone: '02-2345-6789',
        email: 'jobs@together.coop',
        website: 'https://www.together.coop',
      },
    }),
    prisma.company.create({
      data: {
        name: '드림IT',
        address: '경기도 성남시 분당구 판교역로 235',
        city: '경기도',
        district: '성남시',
        latitude: 37.3947,
        longitude: 127.1119,
        geocodeStatus: GeoCodeStatus.SUCCESS,
        phone: '031-345-6789',
        email: 'recruit@dreamit.kr',
        website: 'https://www.dreamit.kr',
      },
    }),
    prisma.company.create({
      data: {
        name: '나눔복지재단',
        address: '부산광역시 해운대구 센텀중앙로 79',
        city: '부산광역시',
        district: '해운대구',
        latitude: 35.1692,
        longitude: 129.1315,
        geocodeStatus: GeoCodeStatus.SUCCESS,
        phone: '051-456-7890',
        email: 'welfare@nanum.or.kr',
      },
    }),
    prisma.company.create({
      data: {
        name: '빛나는내일',
        address: '대전광역시 유성구 대학로 99',
        city: '대전광역시',
        district: '유성구',
        latitude: 36.3728,
        longitude: 127.3637,
        geocodeStatus: GeoCodeStatus.SUCCESS,
        phone: '042-567-8901',
        email: 'career@tomorrow.co.kr',
      },
    }),
  ])

  // Sample job listings
  const jobs = [
    {
      title: '웹 개발자 (프론트엔드)',
      description: `[채용 상세]
- React/Vue.js 기반 웹 프론트엔드 개발
- 사용자 인터페이스 설계 및 구현
- 접근성(a11y) 준수 개발

[자격 요건]
- HTML/CSS/JavaScript 실무 경험 1년 이상
- React 또는 Vue.js 경험자 우대
- 장애인 고용 우대 기업

[근무 조건]
- 주 40시간 근무 (유연근무제)
- 재택근무 주 2회 가능
- 4대 보험 및 퇴직금`,
      companyId: companies[0].id,
      category: '개발',
      employmentType: EmploymentType.FULL_TIME,
      salary: '3,000만원 ~ 4,500만원',
      isRemoteAvailable: true,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      applicationEmail: 'hr@hopebiz.co.kr',
      applicationPhone: '02-1234-5678',
      applicationUrl: 'https://www.hopebiz.co.kr/careers',
    },
    {
      title: '사무 보조원',
      description: `[채용 상세]
- 문서 작성 및 정리
- 전화 응대 및 고객 안내
- 간단한 데이터 입력

[자격 요건]
- 학력 무관
- 컴퓨터 기본 활용 가능자
- 성실하고 책임감 있는 분

[근무 조건]
- 주 5일 근무
- 점심 제공
- 장애인 편의시설 완비`,
      companyId: companies[1].id,
      category: '사무',
      employmentType: EmploymentType.FULL_TIME,
      salary: '2,400만원',
      isRemoteAvailable: false,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
      applicationEmail: 'jobs@together.coop',
      applicationPhone: '02-2345-6789',
    },
    {
      title: '데이터 입력 전문원 (재택)',
      description: `[채용 상세]
- 데이터 입력 및 검수
- 엑셀 기반 데이터 정리
- 100% 재택근무

[자격 요건]
- 타자 속도 200타 이상
- 엑셀 기본 활용 가능
- 집중력 있는 분

[근무 조건]
- 완전 재택근무
- 시간 자율 선택
- 건당 수수료 지급`,
      companyId: companies[2].id,
      category: '데이터입력',
      employmentType: EmploymentType.PART_TIME,
      salary: '시급 12,000원',
      isRemoteAvailable: true,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      applicationEmail: 'recruit@dreamit.kr',
      applicationUrl: 'https://www.dreamit.kr/jobs/data-entry',
    },
    {
      title: '사회복지사',
      description: `[채용 상세]
- 장애인 복지 프로그램 기획 및 운영
- 상담 및 사례관리
- 지역사회 네트워크 구축

[자격 요건]
- 사회복지사 2급 이상 자격증
- 장애인복지 관련 경력 우대
- 관련 전공자 환영

[근무 조건]
- 정규직 (수습 3개월)
- 주 5일 근무
- 성과급 및 복리후생 제공`,
      companyId: companies[3].id,
      category: '복지',
      employmentType: EmploymentType.FULL_TIME,
      salary: '3,200만원 ~ 3,800만원',
      isRemoteAvailable: false,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
      applicationEmail: 'welfare@nanum.or.kr',
      applicationPhone: '051-456-7890',
    },
    {
      title: '콘텐츠 크리에이터 (인턴)',
      description: `[채용 상세]
- SNS 콘텐츠 기획 및 제작
- 영상 편집 보조
- 마케팅 아이디어 제안

[자격 요건]
- 대학교 재학생 또는 졸업예정자
- SNS 활용에 능숙한 분
- 창의적인 아이디어 보유자

[근무 조건]
- 인턴 6개월 (정규직 전환 가능)
- 주 3일 출근 + 재택 2일
- 실습비 지급`,
      companyId: companies[4].id,
      category: '마케팅',
      employmentType: EmploymentType.INTERNSHIP,
      salary: '월 180만원',
      isRemoteAvailable: true,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      applicationEmail: 'career@tomorrow.co.kr',
    },
    {
      title: '고객상담원 (계약직)',
      description: `[채용 상세]
- 전화 및 온라인 고객 상담
- 문의 사항 접수 및 처리
- 고객 만족도 관리

[자격 요건]
- 고졸 이상
- 친절하고 소통능력이 좋은 분
- CS 경력 우대

[근무 조건]
- 계약직 1년 (연장 가능)
- 주 5일 8시간 근무
- 상담 실적에 따른 인센티브`,
      companyId: companies[0].id,
      category: '고객서비스',
      employmentType: EmploymentType.CONTRACT,
      salary: '2,600만원',
      isRemoteAvailable: false,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      applicationPhone: '02-1234-5678',
    },
  ]

  for (const jobData of jobs) {
    await prisma.job.create({
      data: {
        ...jobData,
        status: JobStatus.ACTIVE,
        postedAt: new Date(),
      },
    })
  }

  console.log(`Created ${companies.length} companies`)
  console.log(`Created ${jobs.length} jobs`)
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
