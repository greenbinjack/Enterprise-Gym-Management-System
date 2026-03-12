describe('Member User Journey', () => {
    beforeEach(() => {
        // Intercept network requests and stub responses or login actual test users if the DB supports it.
        // For E2E we can rely on UI login
        cy.visit('/login');
    });

    it('should allow a member to login and view their dashboard', () => {
        // If we don't have a guaranteed seeded DB, we can just intercept the auth and mock it
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: { id: 'm1', role: 'MEMBER', firstName: 'John', email: 'member@test.com' }
        }).as('memberLogin');
        
        cy.intercept('GET', '/api/member/profile', {
            statusCode: 200,
            body: { 
                member: { id: 'm1', firstName: 'John', lastName: 'Doe', email: 'member@test.com' },
                activeSubscriptions: [],
                upcomingClasses: []
            }
        }).as('getProfile');

        cy.get('input[name="email"]').type('member@test.com');
        cy.get('input[name="password"]').type('password123');
        cy.get('button[type="submit"]').click();

        cy.wait('@memberLogin');
        cy.url().should('include', '/member/dashboard');
        // Validate dashboard loads
        cy.contains('My Dashboard').should('be.visible');
        cy.contains('John').should('be.visible');
    });

    it('should allow navigation to the Store', () => {
        // Set mock state to skip login for faster isolated testing
        const mockUser = { id: 'm1', role: 'MEMBER', firstName: 'John', email: 'member@test.com' };
        cy.window().then((win) => {
            win.localStorage.setItem('user', JSON.stringify(mockUser));
            win.localStorage.setItem('token', 'fake-jwt');
            win.localStorage.setItem('userRole', 'MEMBER');
        });

        cy.intercept('GET', '/api/packages', {
            statusCode: 200,
            body: [
                { id: 'p1', name: 'Elite Membership', price: 99.99, durationMonths: 1, type: 'MEMBERSHIP' },
                { id: 'p2', name: '10 Class Pack', price: 150.00, creditCount: 10, type: 'CLASS_PACKAGE' }
            ]
        }).as('getPackages');

        cy.visit('/member/store');
        cy.wait('@getPackages');

        cy.contains('Elite Membership').should('be.visible');
        cy.contains('10 Class Pack').should('be.visible');
    });
});
