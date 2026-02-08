import { describe, test, expect } from '@jest/globals';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

describe('Scheme API Tests', () => {
  test('should get all schemes', async () => {
    const response = await axios.get(`${BASE_URL}/schemes`);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);
  });
});
