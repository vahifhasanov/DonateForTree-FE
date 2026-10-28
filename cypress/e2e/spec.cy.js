const pages = [
  ['/', 'LOGIN'],
  ['/map', 'Tree map'],
  ['/trees', 'My trees'],
  ['/plant', 'Plant a tree'],
  ['/login', 'Welcome'],
  ['/signup', 'Join'],
]
function checkLayout() {
  cy.get('h1').should('be.visible')
  cy.document().then((doc) => {
    expect(doc.documentElement.scrollWidth).to.be.at.most(
      doc.documentElement.clientWidth,
    )
    doc.querySelectorAll('img').forEach((image) => {
      expect(
        image.complete && image.naturalWidth > 0,
        image.getAttribute('src'),
      ).to.equal(true)
    })
    // A page can have no horizontal scroll while text still spills out of a button.
    doc.querySelectorAll('button, a[class*="_button_"]').forEach((control) => {
      if (!control.checkVisibility()) return
      const bounds = control.getBoundingClientRect()
      const text = doc.createRange()
      text.selectNodeContents(control)
      for (const rect of text.getClientRects()) {
        expect(rect.left, `${control.textContent.trim()} left`).to.be.at.least(
          bounds.left - 1,
        )
        expect(rect.right, `${control.textContent.trim()} right`).to.be.at.most(
          bounds.right + 1,
        )
        expect(rect.top, `${control.textContent.trim()} top`).to.be.at.least(
          bounds.top - 1,
        )
        expect(
          rect.bottom,
          `${control.textContent.trim()} bottom`,
        ).to.be.at.most(bounds.bottom + 1)
      }
    })
    doc.querySelectorAll('nav a').forEach((link) => {
      if (!link.checkVisibility()) return
      const rect = link.getBoundingClientRect()
      const hit = doc.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      )
      expect(
        link.contains(hit),
        `${link.textContent.trim()} is not covered`,
      ).to.equal(true)
    })
    const custom = doc.querySelector('input[aria-label="Custom amount in UAH"]')
    if (custom) {
      const option = custom.parentElement.parentElement.getBoundingClientRect()
      const input = custom.getBoundingClientRect()
      expect(input.left).to.be.at.least(option.left)
      expect(input.right).to.be.at.most(option.right)
    }
    const map = doc.querySelector('[aria-label^="Static map of Ukraine"]')
    if (map) {
      const frame = map.getBoundingClientRect()
      const image = map.querySelector('img').getBoundingClientRect()
      expect(image.left).to.be.at.most(frame.left)
      expect(image.right).to.be.at.least(frame.right)
      expect(image.bottom).to.be.at.least(frame.bottom)
      map.querySelectorAll('span').forEach((marker) => {
        const rect = marker.getBoundingClientRect()
        expect(rect.left).to.be.at.least(frame.left)
        expect(rect.right).to.be.at.most(frame.right)
        expect(rect.top).to.be.at.least(frame.top)
        expect(rect.bottom).to.be.at.most(frame.bottom)
      })
    }
    const about = doc.querySelector('#about-heading')?.closest('section')
    if (about) {
      const end = about.getBoundingClientRect().bottom
      about.querySelectorAll('p').forEach((paragraph) => {
        expect(paragraph.getBoundingClientRect().bottom).to.be.at.most(end)
      })
    }
  })
  cy.window().then((win) => {
    expect(win.visualViewport.scale, 'browser zoom is 100%').to.equal(1)
  })
}
describe('Design pages and responsive layout', () => {
  ;[
    [1920, 1080],
    [1440, 900],
    [1280, 800],
    [1024, 900],
    [901, 900],
    [900, 900],
    [768, 1024],
    [390, 844],
    [320, 740],
  ].forEach(([width, height]) => {
    pages.forEach(([path, heading]) => {
      it(`${path} displays at ${width}px without horizontal overflow or missing images`, () => {
        cy.viewport(width, height)
        cy.visit(path)
        cy.contains('h1', heading).should('be.visible')
        cy.document().then((doc) => doc.fonts.ready)
        cy.get('img').should(($images) => {
          $images.each((_, image) =>
            expect(image.complete && image.naturalWidth > 0).to.equal(true),
          )
        })
        checkLayout()
        if ([1920, 1440, 1280, 768, 390, 320].includes(width))
          cy.screenshot(`${width}-${path === '/' ? 'home' : path.slice(1)}`, {
            capture: 'fullPage',
          })
      })
    })
  })
})
describe('Navigation and interface interactions', () => {
  it('navigates between all pages, supports browser history and reloads direct routes', () => {
    cy.visit('/')
    cy.get('nav').contains('a', 'your trees').click()
    cy.location('pathname').should('eq', '/trees')
    cy.contains('h1', 'My trees').should('be.visible')
    cy.get('main').should('have.focus')
    cy.get('a[aria-label="View tree 2351 on map"]').click()
    cy.location('pathname').should('eq', '/map')
    cy.reload()
    cy.contains('h1', 'Tree map').should('be.visible')
    cy.go('back')
    cy.contains('h1', 'My trees').should('be.visible')
    cy.get('nav').contains('a', 'plant a tree').click()
    cy.contains('h1', 'Plant a tree').should('be.visible')
    cy.get('summary').click()
    cy.contains('a', 'Log in').click()
    cy.location('pathname').should('eq', '/login')
    cy.get('main').contains('a', 'SIGN UP').click()
    cy.location('pathname').should('eq', '/signup')
    cy.get('main').contains('a', 'LOG IN').click()
    cy.location('pathname').should('eq', '/login')
    cy.get('nav').contains('a', 'home').click()
    cy.location('pathname').should('eq', '/')
  })
  it('opens and closes the mobile menu, including Escape and route changes', () => {
    cy.viewport(390, 844)
    cy.visit('/')
    cy.get('nav').should('not.be.visible')
    cy.contains('button', 'Menu')
      .click()
      .should('have.attr', 'aria-expanded', 'true')
    cy.get('nav').should('be.visible')
    cy.get('button[aria-controls="navigation"]').trigger('keydown', {
      key: 'Escape',
    })
    cy.get('nav').should('not.be.visible')
    cy.get('button[aria-controls="navigation"]').should('have.focus')
    cy.contains('button', 'Menu').click()
    cy.get('nav').contains('a', 'your trees').click()
    cy.location('pathname').should('eq', '/trees')
    cy.get('nav').should('not.be.visible')
  })
  it('toggles password visibility and displays an accessible recovery dialog', () => {
    cy.visit('/login')
    cy.get('input[name="password"]').type('demonstration')
    cy.get('button[aria-label="Show password"]').click()
    cy.get('input[name="password"]').should('have.attr', 'type', 'text')
    cy.get('button[aria-label="Hide password"]').click()
    cy.get('input[name="password"]').should('have.attr', 'type', 'password')
    cy.contains('button', 'FORGOT PASSWORD?').click()
    cy.get('dialog').should('be.visible').and('have.attr', 'open')
    cy.get('dialog').contains('button', 'Close').click()
    cy.get('dialog').should('not.be.visible')
  })
  it('keeps auth forms on the same page without requests, saved data or success messages', () => {
    cy.visit('/login')
    cy.window().then((win) => {
      win.__documentMarker = 'unchanged'
      cy.spy(win, 'fetch').as('fetch')
      cy.spy(win.Storage.prototype, 'setItem').as('save')
    })
    cy.get('input[name="email"]').type('demo@example.com')
    cy.get('input[name="password"]').type('demonstration')
    cy.get('form')
      .contains('button', /^Log in$/)
      .click()
    cy.window().its('__documentMarker').should('eq', 'unchanged')
    cy.location('pathname').should('eq', '/login')
    cy.get('@fetch').should('not.have.been.called')
    cy.get('@save').should('not.have.been.called')
    cy.contains('nothing is sent or saved').should('be.visible')
    cy.get('main').contains('a', 'SIGN UP').click()
    cy.get('input[name="name"]').type('Demo User')
    cy.get('input[name="email"]').type('demo@example.com')
    cy.get('input[name="password"]').type('demonstration')
    cy.get('input[name="confirm-password"]').type('demonstration')
    cy.get('form').contains('button', 'Create account').click()
    cy.location('pathname').should('eq', '/signup')
    cy.get('@fetch').should('not.have.been.called')
    cy.get('@save').should('not.have.been.called')
  })
  it('only previews planting options and leaves counters unchanged', () => {
    cy.visit('/plant')
    cy.window().then((win) => {
      win.__documentMarker = 'unchanged'
      cy.spy(win, 'fetch').as('fetch')
      cy.spy(win.Storage.prototype, 'setItem').as('save')
    })
    cy.get('input[name="amount"][value="5"]')
      .check({ force: true })
      .should('be.checked')
    cy.get('input[name="species"][value="Maple"]')
      .check({ force: true })
      .should('be.checked')
    cy.get('form').contains('button', 'Plant tree').click()
    cy.window().its('__documentMarker').should('eq', 'unchanged')
    cy.get('@fetch').should('not.have.been.called')
    cy.get('@save').should('not.have.been.called')
    cy.get('nav').contains('a', 'your trees').click()
    cy.contains('dd', '1800 UAH').should('be.visible')
    cy.contains('button', 'By region')
      .click()
      .should('have.attr', 'aria-pressed', 'true')
    cy.contains('h2', 'Uzhorod · Zakarpattia oblast').should('be.visible')
    cy.get('nav').contains('a', 'home').click()
    cy.contains('p', '2152').should('be.visible')
    cy.wait(3500)
    cy.contains('p', '2152').should('be.visible')
  })
  it('submits map controls without reloading or changing the static preview', () => {
    cy.visit('/map')
    cy.window().then((win) => {
      win.__documentMarker = 'unchanged'
    })
    cy.get('select[name="species"]').select('Oak')
    cy.contains('button', 'Apply filters').click()
    cy.window().its('__documentMarker').should('eq', 'unchanged')
    cy.contains('span', '52').should('be.visible')
  })
  it('provides a keyboard skip link and a usable not-found page', () => {
    cy.visit('/')
    cy.get('a[href="#main"]').focus().should('be.visible')
    cy.get('a[href="#main"]').then(($link) => {
      const style = getComputedStyle($link[0])
      expect(style.outlineStyle).not.to.equal('none')
    })
    cy.visit('/does-not-exist')
    cy.contains('h1', 'Page not found').should('be.visible')
    cy.contains('a', 'Back to home').click()
    cy.location('pathname').should('eq', '/')
  })
})
