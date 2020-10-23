// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('החקלאים')
  })
})

describe('Making an order test', () => {
  it('Visits an order form', () => {
    cy.visit('/')
    cy.contains('a', 'תום המשוגע').click({ force: true });
  })
})
