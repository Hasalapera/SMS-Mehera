const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../models'); 

describe('Auth & User API Tests', () => {

    /**
     * Cleanup after all tests are finished.
     * Closing the database connection prevents Jest from hanging.
     */
    afterAll(async () => {
        if (sequelize) {
            await sequelize.close(); 
        }
    });

    /**
     * Test 1: Negative testing for Login.
     * Verifies that the system denies access for wrong passwords.
     */
    it('should fail login with incorrect credentials', async () => {
        const res = await request(app)
            .post('/api/users/login') 
            .send({
                email: 'testadmin@mehera.com',
                password: 'wrongpassword'
            });
        
        expect([401, 400]).toContain(res.statusCode);
        // Updated from 'error' to 'message' based on your API response
        expect(res.body).toHaveProperty('message'); 
        expect(res.body.success).toBe(false);
    }, 10000); 

    /**
     * Test 2: Security and Middleware testing.
     * Verifies that protected routes are not accessible without a JWT token.
     */
    it('should deny access if no token is provided to protected routes', async () => {
        const res = await request(app).get('/api/users/profile/1');
        
        expect(res.statusCode).not.toBe(200);
        expect([401, 403, 500]).toContain(res.statusCode);
    });

    /**
     * Test 3: Basic Server Health Check.
     * Ensures the API is up and running.
     */
    it('should respond with a valid status for a non-existing route', async () => {
        const res = await request(app).get('/api/undefined-route');
        expect(res.statusCode).toBe(404);
    });
});