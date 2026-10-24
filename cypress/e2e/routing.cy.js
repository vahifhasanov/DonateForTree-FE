const routes = [
  ['/', 'LOGIN'],
  ['/map', 'Tree map'],
  ['/trees', 'My trees'],
  ['/plant', 'Plant a tree'],
  ['/login', 'Welcome'],
  ['/signup', 'Join'],
]
describe('Lab 5 client routing', () => {
  routes.forEach(([path, heading]) => {
    it(`opens and reloads ${path} directly`, () => {
      cy.visit(path)
      cy.contains('h1', heading).should('be.visible')
      cy.reload()
      cy.location('pathname').should('eq', path)
      cy.contains('h1', heading).should('be.visible')
      cy.get('nav a[aria-current="page"]').should('have.attr', 'href', path)
      cy.title().should('not.contain', '404')
    })
  })
  it('preserves the document across navigation, back and forward', () => {
    cy.visit('/')
    cy.window().then((win) => {
      win.__routingMarker = 'same-document'
    })
    cy.get('nav a[href="/trees"]').click()
    cy.get('nav a[href="/map"]').click()
    cy.go('back')
    cy.location('pathname').should('eq', '/trees')
    cy.contains('h1', 'My trees').should('be.visible')
    cy.go('forward')
    cy.location('pathname').should('eq', '/map')
    cy.contains('h1', 'Tree map').should('be.visible')
    cy.window().its('__routingMarker').should('eq', 'same-document')
  })
  ;[
    '/unknown',
    '/something-random',
    '/page-that-does-not-exist',
    '/trees/missing',
  ].forEach((path) => {
    it(`shows 404 at ${path} and returns home without reloading`, () => {
      cy.visit(path)
      cy.reload()
      cy.window().then((win) => {
        win.__routingMarker = 'same-document'
      })
      cy.contains('p', /^404$/).should('be.visible')
      cy.contains('h1', 'Сторінку не знайдено').should('be.visible')
      cy.contains(
        'На жаль, такої сторінки не існує або її було переміщено',
      ).should('be.visible')
      cy.title().should('contain', '404')
      cy.contains('a', 'Повернутися на головну').click()
      cy.location('pathname').should('eq', '/')
      cy.contains('h1', 'LOGIN').should('be.visible')
      cy.window().its('__routingMarker').should('eq', 'same-document')
    })
  })
  ;[320, 390, 768, 1440].forEach((width) => {
    it(`keeps the 404 page usable at ${width}px`, () => {
      cy.viewport(width, 900)
      cy.visit('/unknown')
      cy.document().then((doc) => doc.fonts.ready)
      cy.contains('a', 'Повернутися на головну').should('be.visible')
      cy.document().then((doc) => {
        expect(doc.documentElement.scrollWidth).to.be.at.most(
          doc.documentElement.clientWidth,
        )
      })
    })
  })
})
