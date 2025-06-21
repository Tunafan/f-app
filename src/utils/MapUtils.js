import L, { circleMarker } from 'leaflet'

// Fix for marker icons in Vite/Quasar
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

export const defaultMapCenter = [55.3291, 10.2353]
export const defaultZoom = 8

export function setupLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  })
}

export function createMap(mapElementId, center = defaultMapCenter, zoom = defaultZoom) {
  return L.map(mapElementId).setView(center, zoom)
}

export function addTileLayer(map) {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)
}

export function addMarker(map, position, popupText = 'New marker') {
  const marker = L.marker(position).addTo(map)
  if (popupText) {
    marker.bindPopup(popupText)
  }
  return marker
}


export function locateUser(map, onSuccess, onError) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [position.coords.latitude, position.coords.longitude]
        map.setView(coordinates, 15)
        const userMarker = circleMarker(coordinates).addTo(map)
        if (onSuccess) onSuccess(coordinates, userMarker)
      },
      (error) => {
        if (onError) onError(error)
      }
    )
  } else {
    if (onError) onError(new Error('Geolocation not supported'))
  }
}