// ***********************************************
// Existing routing/layout checks authenticate only when opening a private route.
Cypress.Commands.add('visitDemo', (path) => {
  if (['/trees', '/plant'].includes(path)) {
    cy.request('POST', 'http://127.0.0.1:3001/auth/login', {
      email: 'demo@example.com',
      password: 'DemoTree2026!',
    }).then(({ body }) => {
      cy.visit(path, {
        onBeforeLoad(win) {
          win.localStorage.setItem('donatefortree.session', body.token)
        },
      })
    })
  } else cy.visit(path)
})
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
