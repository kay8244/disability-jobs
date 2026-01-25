/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions)
    setCenter(latlng: LatLng): void
    setLevel(level: number): void
    getLevel(): number
    setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void
    panTo(latlng: LatLng): void
  }

  interface MapOptions {
    center: LatLng
    level: number
  }

  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng)
    extend(latlng: LatLng): void
    getSouthWest(): LatLng
    getNorthEast(): LatLng
  }

  class Marker {
    constructor(options: MarkerOptions)
    setMap(map: Map | null): void
    setPosition(position: LatLng): void
    getPosition(): LatLng
    setImage(image: MarkerImage): void
  }

  interface MarkerOptions {
    map?: Map
    position: LatLng
    title?: string
    image?: MarkerImage
    zIndex?: number
  }

  class MarkerImage {
    constructor(
      src: string,
      size: Size,
      options?: {
        offset?: Point
        alt?: string
        coords?: string
        shape?: string
        spriteOrigin?: Point
        spriteSize?: Size
      }
    )
  }

  class Size {
    constructor(width: number, height: number)
  }

  class Point {
    constructor(x: number, y: number)
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions)
    open(map: Map, marker?: Marker): void
    close(): void
    setContent(content: string | HTMLElement): void
    setPosition(position: LatLng): void
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement
    position?: LatLng
    removable?: boolean
    zIndex?: number
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions)
    setMap(map: Map | null): void
    setPosition(position: LatLng): void
    setContent(content: string | HTMLElement): void
    getPosition(): LatLng
  }

  interface CustomOverlayOptions {
    map?: Map
    position: LatLng
    content: string | HTMLElement
    xAnchor?: number
    yAnchor?: number
    zIndex?: number
  }

  namespace event {
    function addListener(target: any, type: string, callback: (...args: any[]) => void): void
    function removeListener(target: any, type: string, callback: (...args: any[]) => void): void
  }

  function load(callback: () => void): void
}

interface Window {
  kakao: typeof kakao
}

declare const kakao: {
  maps: typeof kakao.maps
}
