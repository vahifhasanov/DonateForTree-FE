import { useEffect, useRef, useState } from 'react'
import { loadLeaflet } from '../utils/leaflet.js'
import { formatDate, regionName } from '../utils/trees.js'
import RequestState from './RequestState.jsx'

function popup(tree) {
  const content = document.createElement('div')
  const heading = document.createElement('strong')
  heading.textContent = `${tree.species} · ${tree.quantity} trees`
  content.append(heading)
  for (const text of [
    regionName(tree.region),
    tree.location,
    `Planting date: ${formatDate(tree.plantedAt)}`,
    `Demo contribution: ${tree.total} UAH`,
    'Approximate demo coordinates; not a confirmed planting site.',
  ]) {
    const line = document.createElement('p')
    line.textContent = text
    content.append(line)
  }
  return content
}

export default function TreeMap({ trees, selectedId }) {
  const container = useRef(null)
  const [instance, setInstance] = useState(null)
  const [state, setState] = useState({ loading: true, error: '' })
  const [attempt, setAttempt] = useState(0)
  const [tileError, setTileError] = useState(false)
  useEffect(() => {
    let active = true
    let map
    let observer
    loadLeaflet()
      .then((L) => {
        if (!active) return
        map = L.map(container.current, {
          center: [49, 26],
          zoom: 6,
          scrollWheelZoom: true,
          zoomControl: true,
        })
        const tiles = L.tileLayer(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          },
        ).addTo(map)
        tiles.on('tileerror', () => {
          if (active) setTileError(true)
        })
        tiles.on('tileload', () => {
          if (active) setTileError(false)
        })
        observer = new ResizeObserver(() => map.invalidateSize())
        observer.observe(container.current)
        setInstance({ L, map, tiles })
        setState({ loading: false, error: '' })
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: error.message })
      })
    return () => {
      active = false
      observer?.disconnect()
      map?.remove()
    }
  }, [attempt])
  useEffect(() => {
    if (!instance) return
    const { L, map } = instance
    const markers = L.featureGroup().addTo(map)
    let selected
    const groups = Object.groupBy(trees, (tree) => tree.coordinates.join(','))
    Object.values(groups).forEach((group) => {
      const tree = group[0]
      const count = group.reduce((sum, item) => sum + item.quantity, 0)
      const content = document.createElement('div')
      // Group coincident points without moving them outside the selected region.
      group.forEach((item) => content.append(popup(item)))
      const marker = L.marker(tree.coordinates, {
        title: `${tree.species}, ${regionName(tree.region)}, ${tree.quantity} trees`,
        alt: `${tree.species} planting`,
        icon: L.divIcon({
          className: 'tree-marker',
          html: `<span>${count}</span>`,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        }),
      })
        .bindPopup(content, { maxHeight: 300 })
        .addTo(markers)
      if (group.some((item) => item.id === selectedId)) selected = marker
    })
    if (selected) {
      map.setView(selected.getLatLng(), 12)
      selected.openPopup()
    } else if (trees.length)
      map.fitBounds(markers.getBounds(), { padding: [50, 50], maxZoom: 11 })
    else map.setView([49, 26], 6)
    return () => markers.remove()
  }, [instance, trees, selectedId])
  return (
    <div className="map-frame">
      <div
        className="leaflet-map"
        ref={container}
        role="region"
        aria-label="Interactive tree map of Ukraine"
      />
      {(state.loading || state.error) && (
        <div className="map-message">
          <RequestState
            {...state}
            retry={() => {
              setState({ loading: true, error: '' })
              setAttempt((value) => value + 1)
            }}
          />
        </div>
      )}
      {tileError && (
        <div className="tile-error" role="status">
          Map tiles are unavailable. Check your connection.{' '}
          <button type="button" onClick={() => instance?.tiles.redraw()}>
            Reload tiles
          </button>
        </div>
      )}
    </div>
  )
}
