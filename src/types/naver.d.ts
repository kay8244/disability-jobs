/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace naver.maps {
  class Map {
    constructor(el: string | HTMLElement, options?: MapOptions)
    setCenter(latlng: LatLng | LatLngLiteral): void
    setZoom(level: number, effect?: boolean): void
    getZoom(): number
    panTo(latlng: LatLng | LatLngLiteral, transitionOptions?: any): void
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral, margin?: any): void
    destroy(): void
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral
    zoom?: number
    minZoom?: number
    maxZoom?: number
    mapTypeId?: string
    zoomControl?: boolean
    zoomControlOptions?: any
  }

  interface LatLngLiteral {
    lat: number
    lng: number
  }

  interface LatLngBoundsLiteral {
    south: number
    west: number
    north: number
    east: number
  }

  class LatLng {
    constructor(lat: number, lng: number)
    lat(): number
    lng(): number
    x: number
    y: number
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng)
    extend(latlng: LatLng | LatLngLiteral): LatLngBounds
    getSW(): LatLng
    getNE(): LatLng
    hasLatLng(latlng: LatLng): boolean
  }

  class Point {
    constructor(x: number, y: number)
    x: number
    y: number
  }

  class Size {
    constructor(width: number, height: number)
    width: number
    height: number
  }

  class Marker {
    constructor(options: MarkerOptions)
    setMap(map: Map | null): void
    getMap(): Map | null
    setPosition(position: LatLng | LatLngLiteral): void
    getPosition(): LatLng
    setIcon(icon: string | ImageIcon | SymbolIcon | HtmlIcon): void
    setTitle(title: string): void
    setZIndex(zIndex: number): void
  }

  interface MarkerOptions {
    map?: Map
    position: LatLng | LatLngLiteral
    title?: string
    icon?: string | ImageIcon | SymbolIcon | HtmlIcon
    zIndex?: number
    clickable?: boolean
  }

  interface ImageIcon {
    url?: string
    content?: string
    size?: Size
    anchor?: Point
    origin?: Point
    scaledSize?: Size
  }

  interface SymbolIcon {
    path: any
    style?: string
    radius?: number
    fillColor?: string
    fillOpacity?: number
    strokeColor?: string
    strokeWeight?: number
    strokeOpacity?: number
    anchor?: Point
  }

  interface HtmlIcon {
    content: string | HTMLElement
    size?: Size
    anchor?: Point
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions)
    open(map: Map, anchor?: Marker | LatLng): void
    close(): void
    setContent(content: string | HTMLElement): void
    setPosition(position: LatLng): void
    getMap(): Map | null
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement
    position?: LatLng
    maxWidth?: number
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    anchorSize?: Size
    anchorSkew?: boolean
    anchorColor?: string
    pixelOffset?: Point
    disableAnchor?: boolean
    disableAutoPan?: boolean
    zIndex?: number
  }

  const Position: {
    CENTER: number
    TOP: number
    TOP_LEFT: number
    TOP_RIGHT: number
    LEFT: number
    RIGHT: number
    BOTTOM: number
    BOTTOM_LEFT: number
    BOTTOM_RIGHT: number
  }

  namespace Event {
    function addListener(target: any, type: string, callback: (...args: any[]) => void): any
    function removeListener(listener: any): void
    function clearListeners(target: any, type: string): void
  }
}

interface Window {
  naver: typeof naver
}

declare const naver: {
  maps: typeof naver.maps
}
