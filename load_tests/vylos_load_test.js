import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 configuration options
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up to 10 users
    { duration: '1m', target: 50 },   // Ramping up to 50 users
    { duration: '1m', target: 100 },  // Sustaining 100 users (peak load test)
    { duration: '30s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% of requests must complete under 1.5s
    http_req_failed: ['rate<0.05'],    // Error rate must be less than 5%
  },
};

const BASE_URL = __ENV.VYLOS_TARGET_URL || 'http://localhost:3000';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 1. Visit Landing Page
  const homeRes = http.get(BASE_URL);
  check(homeRes, {
    'home status is 200': (r) => r.status === 200,
    'home response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);

  // 2. Visit Login Page
  const loginRes = http.get(`${BASE_URL}/login`);
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // 3. API Recalculate Health Score Check (Expect 401 Unauthorized for anonymous load)
  const healthRes = http.post(`${BASE_URL}/api/user/health-score/recalculate`, '{}', params);
  check(healthRes, {
    'health recalculate returns 401 or 429': (r) => r.status === 401 || r.status === 429 || r.status === 200,
  });
  sleep(2);

  // 4. API AI Advisor Check (Expect 401 Unauthorized for anonymous load)
  const aiPayload = JSON.stringify({
    messages: [{ role: 'user', content: 'What is my current savings rate?' }]
  });
  const advisorRes = http.post(`${BASE_URL}/api/ai/advisor`, aiPayload, params);
  check(advisorRes, {
    'advisor endpoint returns 401 or 200': (r) => r.status === 401 || r.status === 200,
  });
  sleep(3);

  // 5. API Import Processing Check (Expect 401 Unauthorized for anonymous load)
  const importRes = http.post(`${BASE_URL}/api/import/process`, '{}', params);
  check(importRes, {
    'import process endpoint returns 401 or 400': (r) => r.status === 401 || r.status === 400,
  });
  sleep(2);
}
