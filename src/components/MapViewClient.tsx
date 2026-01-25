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
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const markersRef = useRef<kakao.maps.Marker[]>([])
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([])
  const userMarkerRef = useRef<kakao.maps.Marker | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Initialize Kakao Maps
  useEffect(() => {
    if (!containerRef.current) return

    const initializeMap = () => {
      if (!containerRef.current || mapRef.current) return

      const mapCenter = center || DEFAULT_CENTER
      const options: kakao.maps.MapOptions = {
        center: new kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
        level: DEFAULT_ZOOM,
      }

      mapRef.current = new kakao.maps.Map(containerRef.current, options)
      setIsMapLoaded(true)
    }

    // Check if kakao maps is loaded
    if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
      // Use kakao.maps.load to ensure SDK is ready
      window.kakao.maps.load(initializeMap)
    } else {
      // Wait for script to load
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao)
          window.kakao.maps.load(initializeMap)
        }
      }, 100)

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkKakao), 10000)

      return () => clearInterval(checkKakao)
    }
  }, [center])

  // Update center when it changes
  useEffect(() => {
    if (mapRef.current && center && isMapLoaded) {
      const newCenter = new kakao.maps.LatLng(center.lat, center.lng)
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
      const position = new kakao.maps.LatLng(userLocation.lat, userLocation.lng)

      // Create user location marker image
      const imageSrc = 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="10" fill="#ef4444" stroke="white" stroke-width="4"/>
          <circle cx="14" cy="14" r="14" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.3"/>
        </svg>
      `)
      const imageSize = new kakao.maps.Size(28, 28)
      const imageOption = { offset: new kakao.maps.Point(14, 14) }
      const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)

      userMarkerRef.current = new kakao.maps.Marker({
        position,
        map: mapRef.current,
        title: '내 위치',
        image: markerImage,
        zIndex: 10,
      })
    }
  }, [userLocation, isMapLoaded])

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return

    // Clear existing markers and overlays
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
    overlaysRef.current.forEach((overlay) => overlay.setMap(null))
    overlaysRef.current = []

    // Create marker image for companies
    const imageSrc = 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 23 12 23s12-14 12-23C24 5.4 18.6 0 12 0z" fill="#2563eb"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>
    `)
    const imageSize = new kakao.maps.Size(24, 35)
    const imageOption = { offset: new kakao.maps.Point(12, 35) }
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)

    // Add new markers
    const bounds = new kakao.maps.LatLngBounds()
    let hasMarkers = false

    markers.forEach((markerData) => {
      const position = new kakao.maps.LatLng(markerData.lat, markerData.lng)
      bounds.extend(position)
      hasMarkers = true

      const marker = new kakao.maps.Marker({
        position,
        map: mapRef.current!,
        title: markerData.title,
        image: markerImage,
      })

      // Create custom overlay for popup
      const overlayContent = document.createElement('div')
      overlayContent.innerHTML = `
        <div style="
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 150px;
          max-width: 250px;
          position: relative;
        ">
          <button style="
            position: absolute;
            top: 4px;
            right: 8px;
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #666;
          " class="close-overlay">&times;</button>
          <strong style="font-size: 14px; color: #1f2937; display: block; margin-bottom: 4px; padding-right: 20px;">
            ${markerData.company}
          </strong>
          <p style="margin: 0; font-size: 12px; color: #4b5563;">
            ${markerData.title}
          </p>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid white;
          margin: 0 auto;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
        "></div>
      `

      const overlay = new kakao.maps.CustomOverlay({
        content: overlayContent,
        position,
        xAnchor: 0.5,
        yAnchor: 1.3,
        zIndex: 5,
      })

      overlaysRef.current.push(overlay)

      // Close button handler
      const closeButton = overlayContent.querySelector('.close-overlay')
      if (closeButton) {
        closeButton.addEventListener('click', (e) => {
          e.stopPropagation()
          overlay.setMap(null)
        })
      }

      // Marker click event
      kakao.maps.event.addListener(marker, 'click', () => {
        // Close all other overlays
        overlaysRef.current.forEach((o) => o.setMap(null))
        // Show this overlay
        overlay.setMap(mapRef.current)
        // Trigger callback
        onMarkerClick?.(markerData.id)
      })

      markersRef.current.push(marker)
    })

    // Include user location in bounds
    if (userLocation) {
      bounds.extend(new kakao.maps.LatLng(userLocation.lat, userLocation.lng))
      hasMarkers = true
    }

    // Fit bounds if there are markers
    if (hasMarkers && mapRef.current) {
      mapRef.current.setBounds(bounds, 50, 50, 50, 50)
    }
  }, [markers, userLocation, onMarkerClick, isMapLoaded])

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
