// Pinned official Leaflet assets with integrity checks; loaded only on the map page.
let pending
function asset(tag, attributes) {
  return new Promise((resolve, reject) => {
    const element = Object.assign(document.createElement(tag), attributes)
    const timer = setTimeout(() => failed(), 15000)
    function failed() {
      clearTimeout(timer)
      element.remove()
      reject(
        new Error(
          'Cannot load the interactive map. Check your internet connection and try again.',
        ),
      )
    }
    element.onload = () => {
      clearTimeout(timer)
      resolve()
    }
    element.onerror = failed
    document.head.append(element)
  })
}
export function loadLeaflet() {
  if (!pending) {
    pending = Promise.all([
      asset('link', {
        rel: 'stylesheet',
        href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
        integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
        crossOrigin: 'anonymous',
      }),
      window.L
        ? Promise.resolve()
        : asset('script', {
            src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
            integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=',
            crossOrigin: 'anonymous',
          }),
    ])
      .then(() => window.L)
      .catch((error) => {
        pending = undefined
        throw error
      })
  }
  return pending
}
