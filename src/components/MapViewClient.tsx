'use client'

import { useEffect, useRef, useState } from 'react'
import { MapMarker } from '@/types'

interface MapViewClientProps {
  markers: MapMarker[]
  center?: { lat: number; lng: number }
  userLocation?: { lat: number; lng: number } | null
  onMarkerClick?: (markerId: string) => void
}

// Default center: Seoul City Hall
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }
const DEFAULT_ZOOM = 7

export default function MapViewClient({
  markers,
  center,
  userLocation,
  onMarkerClick,
}: MapViewClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<naver.maps.Map | null>(null)
  const markersRef = useRef<naver.maps.Marker[]>([])
  const infoWindowsRef = useRef<naver.maps.InfoWindow[]>([])
  const listenersRef = useRef<any[]>([])
  const userMarkerRef = useRef<naver.maps.Marker | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Initialize Naver Maps
  useEffect(() => {
    if (!containerRef.current) return

    const initializeMap = () => {
      if (!containerRef.current || mapRef.current) return

      const mapCenter = center || DEFAULT_CENTER

      mapRef.current = new naver.maps.Map(containerRef.current, {
        center: new naver.maps.LatLng(mapCenter.lat, mapCenter.lng),
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        zoomControlOptions: {
          position: naver.maps.Position ? naver.maps.Position.TOP_RIGHT : undefined,
        },
      })
      setIsMapLoaded(true)
    }

    // Check if Naver Maps SDK is loaded
    if (typeof window !== 'undefined' && window.naver && window.naver.maps) {
      initializeMap()
    } else {
      // Wait for script to load
      const checkNaver = setInterval(() => {
        if (window.naver && window.naver.maps) {
          clearInterval(checkNaver)
          initializeMap()
        }
      }, 100)

      // Cleanup interval after 10 seconds
      const timeout = setTimeout(() => clearInterval(checkNaver), 10000)

      return () => {
        clearInterval(checkNaver)
        clearTimeout(timeout)
      }
    }
  }, [center])

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current && center && isMapLoaded) {
      const newCenter = new naver.maps.LatLng(center.lat, center.lng)
      mapRef.current.setCenter(newCenter)
    }
  }, [center, isMapLoaded])

  // Add/update user location marker
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
      userMarkerRef.current = null
    }

    // Add new user location marker
    if (userLocation) {
      const position = new naver.maps.LatLng(userLocation.lat, userLocation.lng)

      userMarkerRef.current = new naver.maps.Marker({
        position,
        map: mapRef.current,
        title: '내 위치',
        icon: {
          content: `
            <div style="position:relative;width:28px;height:28px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r="10" fill="#ef4444" stroke="white" stroke-width="4"/>
                <circle cx="14" cy="14" r="14" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.3"/>
              </svg>
            </div>
          `,
          size: new naver.maps.Size(28, 28),
          anchor: new naver.maps.Point(14, 14),
        },
        zIndex: 10,
      })
    }
  }, [userLocation, isMapLoaded])

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return

    // Remove existing event listeners
    listenersRef.current.forEach((listener) => naver.maps.Event.removeListener(listener))
    listenersRef.current = []

    // Clear existing markers and info windows
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
    infoWindowsRef.current.forEach((iw) => iw.close())
    infoWindowsRef.current = []

    // Add new markers
    const bounds = new naver.maps.LatLngBounds()
    let hasMarkers = false

    markers.forEach((markerData) => {
      const position = new naver.maps.LatLng(markerData.lat, markerData.lng)
      bounds.extend(position)
      hasMarkers = true

      const marker = new naver.maps.Marker({
        position,
        map: mapRef.current!,
        title: markerData.title,
        icon: {
          content: `
            <div style="cursor:pointer;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 23 12 23s12-14 12-23C24 5.4 18.6 0 12 0z" fill="#2563eb"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
              </svg>
            </div>
          `,
          size: new naver.maps.Size(24, 35),
          anchor: new naver.maps.Point(12, 35),
        },
      })

      // Create info window for popup
      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div style="
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            min-width: 150px;
            max-width: 250px;
          ">
            <strong style="font-size: 14px; color: #1f2937; display: block; margin-bottom: 4px;">
              ${markerData.company}
            </strong>
            <p style="margin: 0; font-size: 12px; color: #4b5563;">
              ${markerData.title}
            </p>
          </div>
        `,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        anchorSize: new naver.maps.Size(10, 10),
        anchorColor: 'white',
        pixelOffset: new naver.maps.Point(0, -8),
        disableAutoPan: false,
      })

      infoWindowsRef.current.push(infoWindow)

      // Marker click event
      const listener = naver.maps.Event.addListener(marker, 'click', () => {
        // Close all other info windows
        infoWindowsRef.current.forEach((iw) => iw.close())
        // Open this info window
        infoWindow.open(mapRef.current!, marker)
        // Trigger callback
        onMarkerClick?.(markerData.id)
      })

      listenersRef.current.push(listener)
      markersRef.current.push(marker)
    })

    // Include user location in bounds
    if (userLocation) {
      bounds.extend(new naver.maps.LatLng(userLocation.lat, userLocation.lng))
      hasMarkers = true
    }

    // Fit bounds if there are markers
    if (hasMarkers && mapRef.current) {
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
    }
  }, [markers, userLocation, onMarkerClick, isMapLoaded])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      listenersRef.current.forEach((listener) => naver.maps.Event.removeListener(listener))
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="application"
        aria-label="채용 기업 위치 지도"
      />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">지도를 불러오는 중...</div>
        </div>
      )}
      {/* Screen reader description */}
      <span className="sr-only">
        지도에 {markers.length}개의 채용 기업 위치가 표시되어 있습니다.
        지도는 보조 기능이며, 채용 목록에서 모든 정보를 확인할 수 있습니다.
      </span>
    </div>
  )
}
