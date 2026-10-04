describe('DonateForTree', () => {
  it('opens the main page', () => {
    cy.visit('http://localhost:5173/')
    cy.contains('Login')
  })
})