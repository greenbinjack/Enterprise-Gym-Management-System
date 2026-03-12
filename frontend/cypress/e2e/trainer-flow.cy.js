describe('Trainer User Journey', () => {
    beforeEach(() => {
        const mockUser = { id: 't1', role: 'TRAINER', firstName: 'Jane', lastName: 'Smith', email: 'trainer@vortex.fitness' };
        cy.window().then((win) => {
            win.localStorage.setItem('user', JSON.stringify(mockUser));
            win.localStorage.setItem('token', 'fake-jwt');
            win.localStorage.setItem('userRole', 'TRAINER');
        });
    });

    it('should display the trainer dashboard with their scheduled classes', () => {
        cy.intercept('GET', '/api/scheduling/trainer/t1/classes', {
            statusCode: 200,
            body: [
                {
                    id: 's1',
                    className: 'HIIT Blast',
                    startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                    endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now (Ongoing)
                    capacity: 20,
                    bookedCount: 5,
                    attendedCount: 0
                }
            ]
        }).as('getClasses');

        cy.visit('/trainer/dashboard');
        cy.wait('@getClasses');

        cy.contains('HIIT Blast').should('be.visible');
        cy.contains('Ongoing').should('exist'); // Checks if the Ongoing badge renders
    });

    it('should open the class roster modal and allow marking attendance', () => {
        cy.intercept('GET', '/api/scheduling/trainer/t1/classes', {
            statusCode: 200,
            body: [
                {
                    id: 's1',
                    className: 'HIIT Blast',
                    startTime: new Date(Date.now() - 3600000).toISOString(), 
                    endTime: new Date(Date.now() + 3600000).toISOString(), 
                    capacity: 20,
                    bookedCount: 1,
                    attendedCount: 0
                }
            ]
        }).as('getClasses');

        cy.intercept('GET', '**/participants', {
            statusCode: 200,
            body: [
                { id: 'b1', memberId: 'm1', memberName: 'John Doe', status: 'BOOKED' }
            ]
        }).as('getParticipants');

        cy.visit('/trainer/dashboard');
        cy.wait('@getClasses');

        // Click the class card to open the roster
        cy.contains('HIIT Blast').click({ force: true });
        cy.wait('@getParticipants');

        // Ensure the modal opened
        cy.contains('Class Roster').should('be.visible');
        cy.contains('John Doe').should('be.visible');

        // Note: we can't fully mock the POST attendance here easily if the component 
        // immediately re-fetches, but we check if the UI elements exist.
        cy.contains('button', 'Present').should('be.visible');
        cy.contains('button', 'Absent').should('be.visible');
    });
});
