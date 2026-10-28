import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import FormField from '../components/FormField.jsx'
import Button from '../components/Button.jsx'

function renderRoute(path) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}
describe('DonateForTree pages', () => {
  test.each([
    ['/', 'LOGIN'],
    ['/map', 'Tree map'],
    ['/trees', 'My trees'],
    ['/plant', 'Plant a tree'],
    ['/login', 'Welcome'],
    ['/signup', 'Join'],
  ])('%s renders its own main heading and shared navigation', (path, title) => {
    const html = renderRoute(path)
    const heading = html
      .match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]
      .replace(/<[^>]*>/g, '')
    expect(heading).toContain(title)
    expect(html).toContain('aria-label="Main navigation"')
    expect(html).toContain('id="main"')
    expect(html).toContain('href="/map"')
    expect(html).toContain('href="/trees"')
    expect(html).toContain('href="/plant"')
  })
  test.each([
    '/missing',
    '/unknown',
    '/something-random',
    '/page-that-does-not-exist',
    '/trees/missing',
  ])('unknown URL %s renders Ukrainian 404 with a usable home link', (path) => {
    const html = renderRoute(path)
    expect(html).toContain('>404</p>')
    expect(html).toContain('Сторінку не знайдено</h1>')
    expect(html).toContain(
      'На жаль, такої сторінки не існує або її було переміщено',
    )
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Повернутися на головну<\/a>/)
    expect(html).toContain('lang="uk"')
  })
  test('planting and authentication clearly identify the unavailable operations', () => {
    expect(renderRoute('/plant')).toContain(
      'Payments and planting are unavailable',
    )
    expect(renderRoute('/login')).toContain('Authentication')
    expect(renderRoute('/signup')).toContain('nothing is sent or saved')
  })
})
describe('Reusable controls', () => {
  test('password field has a matching label, password type and non-submit reveal button', () => {
    const html = renderToStaticMarkup(
      <FormField label="Password" type="password" name="password" />,
    )
    const id = html.match(/<input id="([^"]+)"/)[1]
    expect(html).toContain(`for="${id}"`)
    expect(html).toContain('type="password"')
    expect(html).toContain('aria-label="Show password"')
    expect(html).toContain('type="button"')
  })
  test('buttons do not submit by default', () => {
    expect(renderToStaticMarkup(<Button>Close</Button>)).toContain(
      'type="button"',
    )
    expect(
      renderToStaticMarkup(<Button type="submit">Log in</Button>),
    ).toContain('type="submit"')
  })
})
