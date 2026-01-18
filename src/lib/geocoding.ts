import axios from 'axios'

/**
 * Geocoding service for converting Korean addresses to coordinates
 * Supports Kakao Local API (primary) and OSM Nominatim (fallback)
 */

interface GeocodingResult {
  latitude: number
  longitude: number
  formattedAddress?: string
}

// Korean city center coordinates for fallback geocoding
const KOREAN_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '서울특별시': { lat: 37.5665, lng: 126.978 },
  '서울시': { lat: 37.5665, lng: 126.978 },
  '서울': { lat: 37.5665, lng: 126.978 },
  '부산광역시': { lat: 35.1796, lng: 129.0756 },
  '부산시': { lat: 35.1796, lng: 129.0756 },
  '부산': { lat: 35.1796, lng: 129.0756 },
  '대구광역시': { lat: 35.8714, lng: 128.6014 },
  '대구시': { lat: 35.8714, lng: 128.6014 },
  '대구': { lat: 35.8714, lng: 128.6014 },
  '인천광역시': { lat: 37.4563, lng: 126.7052 },
  '인천시': { lat: 37.4563, lng: 126.7052 },
  '인천': { lat: 37.4563, lng: 126.7052 },
  '광주광역시': { lat: 35.1595, lng: 126.8526 },
  '광주시': { lat: 35.1595, lng: 126.8526 },
  '광주': { lat: 35.1595, lng: 126.8526 },
  '대전광역시': { lat: 36.3504, lng: 127.3845 },
  '대전시': { lat: 36.3504, lng: 127.3845 },
  '대전': { lat: 36.3504, lng: 127.3845 },
  '울산광역시': { lat: 35.5384, lng: 129.3114 },
  '울산시': { lat: 35.5384, lng: 129.3114 },
  '울산': { lat: 35.5384, lng: 129.3114 },
  '세종특별자치시': { lat: 36.4800, lng: 127.2890 },
  '세종시': { lat: 36.4800, lng: 127.2890 },
  '세종': { lat: 36.4800, lng: 127.2890 },
  '경기도': { lat: 37.4138, lng: 127.5183 },
  '경기': { lat: 37.4138, lng: 127.5183 },
  '강원특별자치도': { lat: 37.8228, lng: 128.1555 },
  '강원도': { lat: 37.8228, lng: 128.1555 },
  '강원': { lat: 37.8228, lng: 128.1555 },
  '충청북도': { lat: 36.6357, lng: 127.4917 },
  '충북': { lat: 36.6357, lng: 127.4917 },
  '충청남도': { lat: 36.6588, lng: 126.6728 },
  '충남': { lat: 36.6588, lng: 126.6728 },
  '전라북도': { lat: 35.8203, lng: 127.1089 },
  '전북': { lat: 35.8203, lng: 127.1089 },
  '전라남도': { lat: 34.8161, lng: 126.4629 },
  '전남': { lat: 34.8161, lng: 126.4629 },
  '경상북도': { lat: 36.5760, lng: 128.5056 },
  '경북': { lat: 36.5760, lng: 128.5056 },
  '경상남도': { lat: 35.4606, lng: 128.2132 },
  '경남': { lat: 35.4606, lng: 128.2132 },
  '제주특별자치도': { lat: 33.4996, lng: 126.5312 },
  '제주도': { lat: 33.4996, lng: 126.5312 },
  '제주': { lat: 33.4996, lng: 126.5312 },
}

interface KakaoAddressResponse {
  documents: Array<{
    address_name: string
    x: string // longitude
    y: string // latitude
    address_type: string
  }>
  meta: {
    total_count: number
  }
}

interface NominatimResponse {
  lat: string
  lon: string
  display_name: string
}

/**
 * Parse Korean address to extract city and district
 */
export function parseKoreanAddress(address: string): {
  city: string | null
  district: string | null
} {
  // Korean address patterns
  // e.g., "서울특별시 강남구 테헤란로 123"
  // e.g., "경기도 성남시 분당구 판교로 123"

  const cityPatterns = [
    /^(서울특별시|서울시|서울)/,
    /^(부산광역시|부산시|부산)/,
    /^(대구광역시|대구시|대구)/,
    /^(인천광역시|인천시|인천)/,
    /^(광주광역시|광주시|광주)/,
    /^(대전광역시|대전시|대전)/,
    /^(울산광역시|울산시|울산)/,
    /^(세종특별자치시|세종시|세종)/,
    /^(경기도|경기)/,
    /^(강원특별자치도|강원도|강원)/,
    /^(충청북도|충북)/,
    /^(충청남도|충남)/,
    /^(전라북도|전북)/,
    /^(전라남도|전남)/,
    /^(경상북도|경북)/,
    /^(경상남도|경남)/,
    /^(제주특별자치도|제주도|제주)/,
  ]

  let city: string | null = null
  let remainingAddress = address.trim()

  for (const pattern of cityPatterns) {
    const match = remainingAddress.match(pattern)
    if (match) {
      city = match[1]
      remainingAddress = remainingAddress.replace(pattern, '').trim()
      break
    }
  }

  // Extract district (구/군/시)
  const districtMatch = remainingAddress.match(/^(\S+(?:구|군|시))\s?/)
  const district = districtMatch ? districtMatch[1] : null

  return { city, district }
}

/**
 * Geocode using Kakao Local API
 */
async function geocodeWithKakao(address: string): Promise<GeocodingResult | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY
  if (!apiKey) {
    console.log('Kakao API key not configured, skipping Kakao geocoding')
    return null
  }

  try {
    const response = await axios.get<KakaoAddressResponse>(
      'https://dapi.kakao.com/v2/local/search/address.json',
      {
        params: { query: address },
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
        timeout: 10000,
      }
    )

    if (response.data.documents.length > 0) {
      const doc = response.data.documents[0]
      return {
        latitude: parseFloat(doc.y),
        longitude: parseFloat(doc.x),
        formattedAddress: doc.address_name,
      }
    }

    return null
  } catch (error) {
    console.error('Kakao geocoding failed:', error)
    return null
  }
}

/**
 * Geocode using OSM Nominatim (free, but rate-limited)
 */
async function geocodeWithNominatim(address: string): Promise<GeocodingResult | null> {
  try {
    // Add "South Korea" to improve accuracy
    const searchQuery = `${address}, South Korea`

    const response = await axios.get<NominatimResponse[]>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 1,
          countrycodes: 'kr',
        },
        headers: {
          'User-Agent': 'DisabilityJobsPlatform/1.0 (contact@example.com)',
        },
        timeout: 10000,
      }
    )

    if (response.data.length > 0) {
      const result = response.data[0]
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name,
      }
    }

    return null
  } catch (error) {
    console.error('Nominatim geocoding failed:', error)
    return null
  }
}

/**
 * Get city-level coordinates from address as fallback
 */
function getCityCoordinates(address: string): GeocodingResult | null {
  for (const [city, coords] of Object.entries(KOREAN_CITY_COORDINATES)) {
    if (address.includes(city)) {
      // Add small random offset to prevent markers from stacking
      const offset = () => (Math.random() - 0.5) * 0.02
      return {
        latitude: coords.lat + offset(),
        longitude: coords.lng + offset(),
        formattedAddress: city,
      }
    }
  }
  return null
}

/**
 * Geocode an address using available services
 * Tries Kakao first (if configured), falls back to Nominatim, then city-level
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim().length === 0) {
    return null
  }

  // Try Kakao first (faster and more accurate for Korean addresses)
  const kakaoResult = await geocodeWithKakao(address)
  if (kakaoResult) {
    return kakaoResult
  }

  // Try Nominatim with rate limiting
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const nominatimResult = await geocodeWithNominatim(address)
    if (nominatimResult) {
      return nominatimResult
    }
  } catch (error) {
    console.log('Nominatim failed, using city-level fallback')
  }

  // Final fallback: use city-level coordinates
  return getCityCoordinates(address)
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
