describe('Authentication', () => {
    const email = `test${Date.now()}@example.com`
    const password = 'Password123!'

    it('registers a new user and redirects to login', () => {

        cy.visit('/register')
        cy.get('input[type=email]').type(email)
        cy.get('input[type=password]').type(password)
        cy.contains('button', /^Register$/).click()

        cy.contains('Successfully Registered! Redirecting to login...')
        cy.url().should('include', '/login')
    })

    it('logs in successfully and shows verify page', () => {
        cy.visit('/login')
        cy.get('input[type=email]').type(email)
        cy.get('input[type=password]').type(password)
        cy.contains('button', /^Login$/).click()
        cy.url().should('include', '/verify')

    })

    it('fails with wrong password', () => {
        cy.visit('/login')
        cy.get('input[type=email]').type('wrong@example.com')
        cy.get('input[type=password]').type('badpass')
        cy.contains('button', /^Login$/).click()
        cy.contains('Login failed, please check your credentials.')
    })
    it('navigate to login after logout', () => {
        cy.visit('/login')
        cy.get('input[type=email]').type(email)
        cy.get('input[type=password]').type(password)
        cy.contains('button', /^Login$/).click()
        cy.url().should('include', '/verify')
        cy.contains('button', /^Logout$/).click()
        cy.url().should('include', '/login')


    })
})