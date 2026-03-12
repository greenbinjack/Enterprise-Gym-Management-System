describe('Admin User Journey', () => {
    beforeEach(() => {
        const mockUser = { id: 'admin1', role: 'ADMIN', firstName: 'Super', email: 'admin@vortex.fitness' };
        cy.window().then((win) => {
            win.localStorage.setItem('user', JSON.stringify(mockUser));
            win.localStorage.setItem('token', 'fake-jwt');
            win.localStorage.setItem('userRole', 'ADMIN');
        });
    });

    it('should display the admin command center dashboard', () => {
        cy.intercept('GET', '/api/admin/analytics/dashboard', {
            statusCode: 200,
            body: {
                totalActiveMembers: 1500,
                monthlyRevenue: 45000,
                activeTrainers: 25,
                facilityUtilization: 82,
                debtorsList: [],
                recentAlerts: []
            }
        }).as('getAnalytics');

        cy.visit('/admin/dashboard');
        cy.wait('@getAnalytics');

        cy.contains('Command Center').should('be.visible');
        cy.contains('1500').should('be.visible'); // Active Members metric
    });

    it('should allow admin to manage staff', () => {
        cy.intercept('GET', '/api/staff/directory*', {
            statusCode: 200,
            body: []
        }).as('getStaff');

        cy.intercept('POST', '/api/admin/staff/create', {
            statusCode: 200,
            body: { message: 'Staff member created successfully', tempPassword: 'temp-password' }
        }).as('createStaff');

        cy.visit('/admin/staff');
        cy.wait('@getStaff');

        cy.get('input[placeholder="John"]').type('New');
        cy.get('input[placeholder="Smith"]').type('Staff');
        cy.get('input[type="email"]').type('new.staff@vortex.fitness');
        cy.get('button[type="submit"]').click();

        cy.wait('@createStaff');
        cy.contains('Staff member created successfully').should('be.visible');
        cy.contains('temp-password').should('be.visible');
    });

    it('should allow admin to manage facilities', () => {
        cy.intercept('GET', '/api/admin/facilities/rooms', {
            statusCode: 200,
            body: [
                { id: 'room1', name: 'Main Weight Room', maxCapacity: 100, currentOccupancy: 45 }
            ]
        }).as('getRooms');

        cy.visit('/admin/facilities');
        cy.wait('@getRooms');

        cy.contains('Main Weight Room').should('be.visible');
        // Check for edit/delete buttons
        cy.contains('button', 'Edit').should('be.visible');
        cy.contains('button', 'Delete').should('be.visible');
    });
});
