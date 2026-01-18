'use client'

import { useEffect, useState } from 'react'
import { MapMarker } from '@/types'

interface MapViewProps {
  markers: MapMarker[]
  center?: { lat: number; lng: number }
  onMarkerClick?: (markerId: string) => void
}

/**
 * MapView component using Leaflet + OpenStreetMap
 * Accessibility note: Map is optional and all functionality works without it
 */
export default function MapView({ markers, center, onMarkerClick }: MapViewProps) {
  const [isClient, setIsClient] = useState(false)
  const [MapComponent, setMapComponent] = useState<React.ComponentType<MapViewProps> | null>(null)

  useEffect(() => {
    setIsClient(true)
    // Dynamically import Leaflet to avoid SSR issues
    import('./MapViewClient').then((mod) => {
      setMapComponent(() => mod.default)
    })
  }, [])

  if (!isClient || !MapComponent) {
    return (
      <div
        className="h-full bg-gray-100 flex items-center justify-center"
        role="status"
        aria-label="지도 로딩 중"
      >
        <div className="text-gray-500 text-center">
          <svg
            className="w-12 h-12 mx-auto mb-2 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          지도를 불러오는 중...
        </div>
      </div>
    )
  }

  return <MapComponent markers={markers} center={center} onMarkerClick={onMarkerClick} />
}
