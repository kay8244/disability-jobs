'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapMarker } from '@/types'

interface MapViewClientProps {
  markers: MapMarker[]
  center?: { lat: number; lng: number }
  onMarkerClick?: (markerId: string) => void
}

// Default center: Seoul City Hall
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }
const DEFAULT_ZOOM = 11

// Custom marker icon
const markerIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: #2563eb;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export default function MapViewClient({
  markers,
  center,
  onMarkerClick,
}: MapViewClientProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Initialize map
    const mapCenter = center || DEFAULT_CENTER
    mapRef.current = L.map(containerRef.current, {
      center: [mapCenter.lat, mapCenter.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    })

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView([center.lat, center.lng], DEFAULT_ZOOM)
    }
  }, [center])

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    markers.forEach((markerData) => {
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: markerIcon,
        title: markerData.title,
      })

      // Create popup content
      const popupContent = `
        <div style="min-width: 150px;">
          <strong style="font-size: 14px;">${markerData.company}</strong>
          <p style="margin: 4px 0 0; font-size: 12px; color: #4b5563;">
            ${markerData.title}
          </p>
        </div>
      `

      marker.bindPopup(popupContent)

      marker.on('click', () => {
        onMarkerClick?.(markerData.id)
      })

      marker.addTo(mapRef.current!)
      markersRef.current.push(marker)
    })

    // Fit bounds if there are markers
    if (markers.length > 0) {
      const bounds = L.latLngBounds(
        markers.map((m) => [m.lat, m.lng] as L.LatLngTuple)
      )
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [markers, onMarkerClick])

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label="채용 기업 위치 지도"
    >
      {/* Screen reader description */}
      <span className="sr-only">
        지도에 {markers.length}개의 채용 기업 위치가 표시되어 있습니다.
        지도는 보조 기능이며, 채용 목록에서 모든 정보를 확인할 수 있습니다.
      </span>
    </div>
  )
}
