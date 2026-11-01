describe('Lab 6 business workflows', () => {
  it('redirects guests, registers, creates a planting via POST and restores it after reload', () => {
    cy.visit('/plant')
    cy.location('pathname').should('eq', '/login')
    cy.contains('a', 'SIGN UP').click()
    const email = `gardener-${Date.now()}@example.com`
    cy.get('[name="name"]').type('Test Gardener')
    cy.get('[name="email"]').type(email)
    cy.get('[name="password"]').type('Example123!')
    cy.get('[name="confirm-password"]').type('Example123!')
    cy.contains('button', 'Create account').click()
    cy.location('pathname').should('eq', '/plant')
    cy.get('[name="amount"][value="5"]').check({ force: true })
    cy.get('[name="species"][value="Maple"]').check({ force: true })
    cy.get('[name="region"]').select('lviv')
    cy.contains('5 trees × 150 UAH = 750 UAH').should('be.visible')
    cy.contains('button', 'Review planting').click()
    cy.intercept('POST', '**/trees').as('plant')
    cy.contains('button', 'Confirm demo planting').click()
    cy.wait('@plant').then(({ request, response }) => {
      expect(request.body.quantity).to.eq(5)
      expect(response.statusCode).to.eq(201)
    })
    cy.contains('Demo planting saved!').should('be.visible')
    cy.get('main').contains('a', 'My trees').click()
    cy.contains('dd', '750 UAH').should('be.visible')
    cy.get('article').should('have.length', 1)
    cy.reload()
    cy.get('article').should('have.length', 1)
    cy.get('summary').click()
    cy.contains('button', 'Log out').click()
    cy.location('pathname').should('eq', '/login')
    cy.get('[name="email"]').type(email)
    cy.get('[name="password"]').type('Example123!')
    cy.get('form')
      .contains('button', /^Log in$/)
      .click()
    cy.location('pathname').should('eq', '/trees')
    cy.get('article').should('have.length', 1)
  })
  it('handles HTTP failures and allows retry without crashing', () => {
    cy.intercept('GET', '**/trees', {
      statusCode: 503,
      body: { message: 'Test API unavailable' },
    }).as('failed')
    cy.visit('/map')
    cy.wait('@failed')
    cy.contains('[role="alert"]', 'Test API unavailable').should('be.visible')
    cy.intercept('GET', '**/trees', { body: [] })
    cy.contains('button', 'Try again').click()
    cy.contains('No trees match your filters.').should('be.visible')
  })
  it('uses actual Leaflet markers, popup, zoom, search and combined filters', () => {
    cy.request('POST', 'http://127.0.0.1:3001/auth/login', {
      email: 'demo@example.com',
      password: 'DemoTree2026!',
    }).then(({ body }) => {
      cy.request({
        method: 'POST',
        url: 'http://127.0.0.1:3001/trees',
        headers: {
          Authorization: 'Bearer ' + body.token,
          'Idempotency-Key': 'map-test-' + Date.now(),
        },
        body: { quantity: 1, species: 'Oak', region: 'zakarpattia' },
      }).then(({ body: tree }) => {
        cy.intercept('GET', '**/trees', { body: [tree] })
      })
    })
    cy.visit('/map')
    cy.get('.leaflet-control-zoom-in', { timeout: 20000 }).should('be.visible')
    cy.get('.tree-marker').should('have.length', 1)
    cy.get('[name="region"]').select('zakarpattia')
    cy.get('[name="species"]').select('Oak')
    cy.get('[name="year"]').select(String(new Date().getFullYear()))
    cy.get('.tree-marker').should('have.length', 1).click()
    cy.get('.leaflet-popup-content')
      .should('contain', 'Oak')
      .and('contain', 'Planting date')
    cy.get('.leaflet-control-zoom-in').click()
    cy.get('.leaflet-control-zoom-out').click()
    cy.get('[name="search"]').type('no such location')
    cy.get('.tree-marker').should('not.exist')
    cy.contains('No trees match your filters.').should('be.visible')
    cy.contains('button', 'Reset filters').click()
    cy.get('.tree-marker').should('have.length', 1)
  })
})
