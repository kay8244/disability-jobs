import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { geocodeAddress } from '@/lib/geocoding'
import { GeoCodeStatus } from '@prisma/client'

/**
 * POST /api/geocode
 * Batch geocode companies without coordinates
 * Use ?reset=true to re-geocode all companies
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reset = searchParams.get('reset') === 'true'

    // If reset, clear all coordinates first
    if (reset) {
      await prisma.company.updateMany({
        data: {
          latitude: null,
          longitude: null,
          geocodeStatus: GeoCodeStatus.PENDING,
        },
      })
      console.log('Reset all company coordinates')
    }

    // Find companies without coordinates
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
        address: { not: null },
      },
      take: 50, // Process in batches
    })

    console.log(`Found ${companies.length} companies to geocode`)

    let updated = 0
    let failed = 0

    for (const company of companies) {
      if (!company.address) continue

      try {
        const result = await geocodeAddress(company.address)

        if (result) {
          await prisma.company.update({
            where: { id: company.id },
            data: {
              latitude: result.latitude,
              longitude: result.longitude,
              geocodeStatus: GeoCodeStatus.SUCCESS,
            },
          })
          updated++
          console.log(`Geocoded: ${company.name} -> ${result.latitude}, ${result.longitude}`)
        } else {
          await prisma.company.update({
            where: { id: company.id },
            data: {
              geocodeStatus: GeoCodeStatus.NOT_FOUND,
            },
          })
          failed++
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to geocode ${company.name}:`, error)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Geocoding completed`,
      stats: {
        processed: companies.length,
        updated,
        failed,
      },
    })
  } catch (error) {
    console.error('Geocoding batch failed:', error)
    return NextResponse.json(
      { error: 'Geocoding failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/geocode
 * Get geocoding stats
 */
export async function GET() {
  const [total, withCoords, pending] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
    }),
    prisma.company.count({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
    }),
  ])

  return NextResponse.json({
    total,
    withCoordinates: withCoords,
    pending,
    percentComplete: total > 0 ? Math.round((withCoords / total) * 100) : 0,
  })
}
