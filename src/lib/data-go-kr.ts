import axios from 'axios'

/**
 * data.go.kr API Client for disability employment data
 * 한국장애인고용공단_장애인 구인 실시간 현황 API
 * https://www.data.go.kr/data/15117692/openapi.do
 */

const API_BASE_URL = 'https://apis.data.go.kr/B552583/job'

interface DataGoKrResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      items: {
        item: RawJobData[] | RawJobData
      }
      numOfRows: number
      pageNo: number
      totalCount: number
    }
  }
}

// Raw job data from API
export interface RawJobData {
  rno?: string           // 연번
  rnum?: string          // row number
  offerregDt?: string    // 구인신청일
  termDate?: string      // 모집기간 (마감일)
  busplaName?: string    // 사업장명
  jobNm?: string         // 모집직종
  empType?: string       // 고용형태 (정규직, 계약직 등)
  enterType?: string     // 입사형태
  salaryType?: string    // 임금형태
  salary?: string        // 임금
  reqCareer?: string     // 요구경력
  reqEduc?: string       // 요구학력
  compAddr?: string      // 사업장 주소
  cntctNo?: string       // 연락처
  regagnName?: string    // 담당기관
  regDt?: string         // 등록일
  // Work environment fields
  envBothHands?: string  // 양손 작업환경
  envEyesight?: string   // 시력 작업환경
  envHandwork?: string   // 수작업 작업환경
  envLiftPower?: string  // 들기 작업환경
  envLstnTalk?: string   // 듣기/말하기 작업환경
  envStndWalk?: string   // 서기/걷기 작업환경
}

export class DataGoKrClient {
  private apiKey: string

  constructor() {
    const apiKey = process.env.DATA_GO_KR_API_KEY
    if (!apiKey) {
      throw new Error('DATA_GO_KR_API_KEY environment variable is required')
    }
    // Encode the API key for URL use
    this.apiKey = encodeURIComponent(apiKey)
  }

  /**
   * Fetch job listings from data.go.kr
   */
  async fetchJobs(pageNo: number = 1, numOfRows: number = 100): Promise<RawJobData[]> {
    try {
      // Build URL with serviceKey directly to avoid double-encoding
      const url = `${API_BASE_URL}/job_list?serviceKey=${this.apiKey}&pageNo=${pageNo}&numOfRows=${numOfRows}`

      console.log(`Fetching page ${pageNo} with ${numOfRows} rows...`)

      const response = await axios.get<DataGoKrResponse>(url, {
        timeout: 30000,
      })

      // Handle XML error responses
      if (typeof response.data === 'string') {
        console.error('Received string response (possibly XML error):', response.data)
        throw new Error('Invalid API response format')
      }

      const { header, body } = response.data.response

      // Check for success codes (different APIs use different codes)
      if (header.resultCode !== '00' && header.resultCode !== '0000') {
        throw new Error(`API Error: ${header.resultMsg} (code: ${header.resultCode})`)
      }

      // Handle single item vs array
      const items = body.items?.item
      if (!items) {
        return []
      }

      return Array.isArray(items) ? items : [items]
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API request failed:', error.message)
        if (error.response) {
          console.error('Response status:', error.response.status)
          console.error('Response data:', error.response.data)
        }
        throw new Error(`Failed to fetch jobs: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Fetch all jobs with pagination
   */
  async fetchAllJobs(maxPages: number = 10): Promise<RawJobData[]> {
    const allJobs: RawJobData[] = []
    let pageNo = 1
    const numOfRows = 100
    let hasMore = true

    while (hasMore && pageNo <= maxPages) {
      try {
        const jobs = await this.fetchJobs(pageNo, numOfRows)
        console.log(`Page ${pageNo}: fetched ${jobs.length} jobs`)

        allJobs.push(...jobs)

        if (jobs.length < numOfRows) {
          hasMore = false
        } else {
          pageNo++
          // Rate limiting - wait 500ms between requests
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        console.error(`Error fetching page ${pageNo}:`, error)
        break
      }
    }

    console.log(`Total jobs fetched: ${allJobs.length}`)
    return allJobs
  }
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null

  // Try different formats
  // Format: "2024.01.15" or "2024-01-15" or "20240115"
  const cleanDate = dateStr.replace(/\./g, '-').trim()

  // Handle "YYYY-MM-DD" format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    const parsed = new Date(cleanDate)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }

  // Handle "YYYYMMDD" format
  if (/^\d{8}$/.test(dateStr)) {
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    const parsed = new Date(`${year}-${month}-${day}`)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }

  // Handle date ranges like "2024.01.01~2024.01.31"
  if (dateStr.includes('~')) {
    const endDate = dateStr.split('~')[1]?.trim()
    if (endDate) {
      return parseDate(endDate)
    }
  }

  return null
}

/**
 * Normalize raw API data to our database schema format
 */
export function normalizeJobData(raw: RawJobData): {
  company: {
    externalId: string | null
    name: string
    address: string | null
    phone: string | null
    email: string | null
    website: string | null
  }
  job: {
    externalId: string | null
    title: string
    description: string | null
    category: string | null
    employmentType: 'FULL_TIME' | 'CONTRACT' | 'PART_TIME' | 'INTERNSHIP' | 'TEMPORARY' | 'OTHER'
    salary: string | null
    isRemoteAvailable: boolean
    workLocation: string | null
    deadline: Date | null
    applicationUrl: string | null
    applicationEmail: string | null
    applicationPhone: string | null
  }
} {
  // Normalize employment type
  const employmentTypeMap: Record<string, 'FULL_TIME' | 'CONTRACT' | 'PART_TIME' | 'INTERNSHIP' | 'TEMPORARY' | 'OTHER'> = {
    '정규직': 'FULL_TIME',
    '상용직': 'FULL_TIME',
    '계약직': 'CONTRACT',
    '기간제': 'CONTRACT',
    '파트타임': 'PART_TIME',
    '시간제': 'PART_TIME',
    '아르바이트': 'PART_TIME',
    '인턴': 'INTERNSHIP',
    '인턴십': 'INTERNSHIP',
    '임시직': 'TEMPORARY',
    '일용직': 'TEMPORARY',
  }

  const empTypeStr = raw.empType || ''
  let employmentType: 'FULL_TIME' | 'CONTRACT' | 'PART_TIME' | 'INTERNSHIP' | 'TEMPORARY' | 'OTHER' = 'OTHER'

  for (const [key, value] of Object.entries(employmentTypeMap)) {
    if (empTypeStr.includes(key)) {
      employmentType = value
      break
    }
  }

  // Parse deadline from termDate
  const deadline = parseDate(raw.termDate)

  // Build job description from available fields
  const descriptionParts: string[] = []
  if (raw.reqCareer) descriptionParts.push(`[요구경력] ${raw.reqCareer}`)
  if (raw.reqEduc) descriptionParts.push(`[요구학력] ${raw.reqEduc}`)
  if (raw.enterType) descriptionParts.push(`[입사형태] ${raw.enterType}`)
  if (raw.salaryType) descriptionParts.push(`[임금형태] ${raw.salaryType}`)
  if (raw.regagnName) descriptionParts.push(`[담당기관] ${raw.regagnName}`)

  // Add work environment info if available
  const envInfo: string[] = []
  if (raw.envBothHands) envInfo.push(`양손작업: ${raw.envBothHands}`)
  if (raw.envEyesight) envInfo.push(`시력: ${raw.envEyesight}`)
  if (raw.envHandwork) envInfo.push(`수작업: ${raw.envHandwork}`)
  if (raw.envLiftPower) envInfo.push(`들기: ${raw.envLiftPower}`)
  if (raw.envLstnTalk) envInfo.push(`듣기/말하기: ${raw.envLstnTalk}`)
  if (raw.envStndWalk) envInfo.push(`서기/걷기: ${raw.envStndWalk}`)

  if (envInfo.length > 0) {
    descriptionParts.push(`\n[작업환경]\n${envInfo.join('\n')}`)
  }

  const description = descriptionParts.length > 0 ? descriptionParts.join('\n') : null

  // Check remote work availability (usually not in this API, but check address)
  const isRemoteAvailable = (raw.compAddr?.includes('재택') || raw.jobNm?.includes('재택')) ?? false

  // Generate external ID from rno or combination of fields (convert to string)
  const externalId = String(raw.rno || raw.rnum || `${raw.busplaName}-${raw.offerregDt}-${raw.jobNm}`).substring(0, 100)

  return {
    company: {
      externalId: raw.busplaName ? `company-${raw.busplaName}` : null,
      name: raw.busplaName || '미상',
      address: raw.compAddr || null,
      phone: raw.cntctNo || null,
      email: null, // Not provided in this API
      website: null, // Not provided in this API
    },
    job: {
      externalId,
      title: raw.jobNm || '채용공고',
      description,
      category: raw.jobNm || null,
      employmentType,
      salary: raw.salary || null,
      isRemoteAvailable,
      workLocation: raw.compAddr || null,
      deadline,
      applicationUrl: null, // Not provided in this API
      applicationEmail: null,
      applicationPhone: raw.cntctNo || null,
    },
  }
}

export default DataGoKrClient
