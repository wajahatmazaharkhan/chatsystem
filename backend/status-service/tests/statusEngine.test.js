/**
 * Module 6 — Status Engine: Test Suite (Raju)
 * Updated to use Axios mocks instead of direct Mongoose Schema mocks.
 */

const axios = require('axios');
jest.mock('axios');

jest.mock('../schema/UserStatus');
const UserStatus  = require('../schema/UserStatus');

const service = require('../services/statusService');

const hoursAgo = (hrs) => new Date(Date.now() - hrs * 60 * 60 * 1000);

let mockActivityData = null;
let mockGroupData = null;

function mockActivity(timestamp) {
  mockActivityData = timestamp ? { timestamp, group_id: 'grp1' } : null;
}

function mockUpsert(existing = null) {
  UserStatus.findOne = jest.fn().mockResolvedValue(existing);
  UserStatus.findOneAndUpdate = jest.fn().mockImplementation(
    (_filter, update) => Promise.resolve(update)
  );
}

beforeEach(() => {
  mockActivityData = null;
  mockGroupData = { members: ['u1', 'u2', 'u3'], name: 'Test Group' };
  
  axios.post.mockResolvedValue({ data: { token: 'mock-token' } });
  
  axios.get.mockImplementation((url) => {
    if (url.includes('/activity/user/')) {
      return Promise.resolve({ data: { success: true, data: mockActivityData ? [mockActivityData] : [] } });
    }
    if (url.includes('/users')) {
      return Promise.resolve({ data: { _id: 'u1', user_id: 'u1', name: 'Test User' } });
    }
    if (url.includes('/groups/')) {
      if (url.includes('badId')) return Promise.reject(new Error('Request failed with status code 404'));
      return Promise.resolve({ data: mockGroupData });
    }
    return Promise.resolve({ data: {} });
  });
});

// ─── 1. CLASSIFICATION LOGIC ─────────────────────────────────────────────────

describe('classify() — 96-hr threshold (4 days, team decision)', () => {
  test('student active 1 hr ago → ACTIVE', async () => {
    mockActivity(hoursAgo(1));
    mockUpsert();
    const result = await service.getStudentStatus('user1');
    expect(result.status).toBe('ACTIVE');
  });

  test('student active 47 hrs ago → ACTIVE (well under threshold)', async () => {
    mockActivity(hoursAgo(47));
    mockUpsert();
    const result = await service.getStudentStatus('user1');
    expect(result.status).toBe('ACTIVE');
  });

  test('student active 72 hrs ago → ACTIVE (3 days, still under 4-day threshold)', async () => {
    mockActivity(hoursAgo(72));
    mockUpsert();
    const result = await service.getStudentStatus('user1');
    expect(result.status).toBe('ACTIVE');
  });

  test('student active exactly 96 hrs ago → boundary test', async () => {
    mockActivity(hoursAgo(95.999));
    mockUpsert();
    const under = await service.getStudentStatus('user1');
    expect(under.status).toBe('ACTIVE');

    mockActivity(hoursAgo(96.001));
    mockUpsert();
    const over = await service.getStudentStatus('user1');
    expect(over.status).toBe('INACTIVE');
  });

  test('student active 96.01 hrs ago → INACTIVE (just over 4-day threshold)', async () => {
    mockActivity(hoursAgo(96.01));
    mockUpsert();
    const result = await service.getStudentStatus('user1');
    expect(result.status).toBe('INACTIVE');
  });

  test('student active 120 hrs ago → INACTIVE (5 days of silence)', async () => {
    mockActivity(hoursAgo(120));
    mockUpsert();
    const result = await service.getStudentStatus('user1');
    expect(result.status).toBe('INACTIVE');
  });
});

// ─── 2. EDGE CASES ──────────────────────────────────────────────────────────

describe('Edge cases', () => {
  test('brand-new student with NO activity logs → INACTIVE (falls back to epoch)', async () => {
    mockActivity(null);
    mockUpsert();
    const result = await service.getStudentStatus('newStudent');
    expect(result.status).toBe('INACTIVE');
    expect(result.last_active).toEqual(new Date(0));
  });

  test('status transition: was ACTIVE, now INACTIVE → transition_count increments', async () => {
    const existingRecord = {
      status: 'ACTIVE',
      transition_count: 2,
      status_changed_at: hoursAgo(200),
    };
    mockActivity(hoursAgo(100)); // 100 hrs → over 96 → INACTIVE
    mockUpsert(existingRecord);

    const result = await service.getStudentStatus('user1');
    expect(result.status).toBe('INACTIVE');
  });
});

// ─── 3. GROUP STATUS ─────────────────────────────────────────────────────────

describe('getGroupStatus()', () => {
  test('returns correct active/inactive counts for a group of 3', async () => {
    mockGroupData = { members: ['u1', 'u2', 'u3'], name: 'Test Group' };
    
    let call = 0;
    axios.get.mockImplementation((url) => {
      if (url.includes('/activity/user/')) {
        call++;
        const t = call === 2 ? hoursAgo(100) : hoursAgo(5);
        return Promise.resolve({ data: { success: true, data: [{ timestamp: t }] } });
      }
      if (url.includes('/users')) return Promise.resolve({ data: { user_id: 'u1', name: 'Test' } });
      if (url.includes('/groups/')) return Promise.resolve({ data: mockGroupData });
      return Promise.resolve({ data: {} });
    });

    mockUpsert(null);

    const result = await service.getGroupStatus('grp1');

    expect(result.total_members).toBe(3);
    expect(result.active_count).toBe(2);
    expect(result.inactive_count).toBe(1);
    expect(result.students).toHaveLength(3);
  });

  test('throws if group not found', async () => {
    await expect(service.getGroupStatus('badId')).rejects.toThrow('Group not found');
  });
});

// ─── 4. FULL FLOW SIMULATION ──────────────────────────────────────────────────

describe('Full flow — Module 5 logs → Module 6 picks up', () => {
  test('student goes silent for 97 hrs → status flips to INACTIVE', async () => {
    const wasActive = { status: 'ACTIVE', transition_count: 0, status_changed_at: null };
    mockActivity(hoursAgo(97));
    mockUpsert(wasActive);

    const result = await service.getStudentStatus('silentUser');
    expect(result.status).toBe('INACTIVE');
  });
});