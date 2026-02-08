import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

describe('Authentication API Tests', () => {
  let testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123'
  };
  let authToken;

  describe('POST /auth/register', () => {
    test('should register a new user', async () => {
      const response = await axios.post(`${BASE_URL}/auth/register`, testUser);

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.email).toBe(testUser.email);
      expect(response.data.data.isVerified).toBe(false);
    });

    test('should not register duplicate email', async () => {
      try {
        await axios.post(`${BASE_URL}/auth/register`, testUser);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('already exists');
      }
    });
  });

  describe('POST /auth/login', () => {
    test('should not login unverified user', async () => {
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        throw new Error('Should have failed');
      } catch (error) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.message).toContain('verify your email');
      }
    });
  });
});
