describe('Public Access & Authentication Redirects', () => {
    it('should display the public Home page to unauthenticated users', () => {
        cy.visit('/');
        cy.contains('VORTEX').should('be.visible');
        cy.contains('Sign In').should('be.visible');
    });

    it('should allow navigation to About and Careers', () => {
        cy.visit('/');
        cy.contains('About Us').click();
        cy.url().should('include', '/about');
        cy.contains('Our Philosophy').should('be.visible');

        cy.contains('Careers').click();
        cy.url().should('include', '/careers');
        cy.contains('Join Our Elite Team').should('be.visible');
    });

    it('should redirect unauthenticated users away from protected routes', () => {
        const protectedRoutes = [
            '/member/dashboard',
            '/trainer/dashboard',
            '/staff/dashboard',
            '/admin/dashboard'
        ];

        protectedRoutes.forEach((route) => {
            cy.visit(route);
            // Assuming App.jsx redirects to /login if there is no user in localStorage
            cy.url().should('include', '/login');
        });
    });

    it('should redirect authenticated users away from public routes', () => {
        const mockAdminUser = { id: '1', role: 'ADMIN', firstName: 'Admin', email: 'admin@vortex.fitness' };
        const publicRoutes = ['/', '/login', '/register', '/about', '/careers', '/forgot-password'];
        
        publicRoutes.forEach((route) => {
            cy.visit(route, {
                onBeforeLoad(win) {
                    win.localStorage.setItem('user', JSON.stringify(mockAdminUser));
                    win.localStorage.setItem('token', 'fake-jwt');
                    win.localStorage.setItem('userRole', 'ADMIN');
                }
            });
            
            // Wait for React to mount and the Navbar to be visible
            cy.get('nav').should('be.visible');

            // Now assert that PublicLayout's useEffect successfully cleared the token
            cy.window().its('localStorage').invoke('getItem', 'token').should('be.null');
        });
    });
});
