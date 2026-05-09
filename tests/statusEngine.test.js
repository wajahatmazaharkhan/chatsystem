/**
 * Module 6 — Status Engine: Test Suite (Raju)
 *
 * Covers:
 *  1. Classification logic unit tests (96-hr / 4-day threshold)
 *  2. getStudentStatus — new student, exact 96-hr boundary
 *  3. getGroupStatus — summary aggregation
 *  4. Full flow — activity logged → status picks it up
 *  5. RBAC — students cannot call status endpoints
 */

jest.mock('../schema/ActivityLog');
jest.mock('../schema/UserStatus');
jest.mock('../schema/Group');

const ActivityLog = require('../schema/ActivityLog');
const UserStatus  = require('../schema/UserStatus');
const Group       = require('../schema/Group');

const service = require('../services/statusService');

const hoursAgo = (hrs) =>
  new Date(Date.now() - hrs * 60 * 60 * 1000);

function mockActivity(timestamp) {
  const doc = timestamp ? { timestamp, group_id: 'grp1' } : null;
  ActivityLog.findOne = jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue(doc),
  });
}

function mockUpsert(existing = null) {
  UserStatus.findOne = jest.fn().mockResolvedValue(existing);
  UserStatus.findOneAndUpdate = jest.fn().mockImplementation(
    (_filter, update) => Promise.resolve(update)
  );
}

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
    mockActivity(hoursAgo(95.999)); // just under → ACTIVE
    mockUpsert();
    const under = await service.getStudentStatus('user1');
    expect(under.status).toBe('ACTIVE');

    mockActivity(hoursAgo(96.001)); // just over → INACTIVE
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
    expect(result.last_active_at).toEqual(new Date(0));
  });

  test('student who just signed up moments ago — no logs yet → INACTIVE', async () => {
    mockActivity(null);
    mockUpsert();
    const result = await service.getStudentStatus('brandNew');
    expect(result.status).toBe('INACTIVE');
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
    expect(result.transition_count).toBe(3);
    expect(result.status_changed_at).toBeInstanceOf(Date);
  });

  test('status unchanged: still ACTIVE → transition_count stays same', async () => {
    const existingRecord = {
      status: 'ACTIVE',
      transition_count: 1,
      status_changed_at: hoursAgo(10),
    };
    mockActivity(hoursAgo(5)); // 5 hrs → still ACTIVE
    mockUpsert(existingRecord);

    const result = await service.getStudentStatus('user1');
    expect(result.status).toBe('ACTIVE');
    expect(result.transition_count).toBe(1);
  });

  test('evaluated_at is always fresh (set to current time)', async () => {
    const before = Date.now();
    mockActivity(hoursAgo(1));
    mockUpsert();
    const result = await service.getStudentStatus('user1');
    const after = Date.now();
    const evaluatedAt = new Date(result.evaluated_at).getTime();
    expect(evaluatedAt).toBeGreaterThanOrEqual(before);
    expect(evaluatedAt).toBeLessThanOrEqual(after);
  });

});

// ─── 3. GROUP STATUS ─────────────────────────────────────────────────────────

describe('getGroupStatus()', () => {

  test('returns correct active/inactive counts for a group of 3', async () => {
    Group.findById = jest.fn().mockResolvedValue({
      members: ['u1', 'u2', 'u3'],
    });

    // u1 → 5 hrs ago (ACTIVE), u2 → 100 hrs ago (INACTIVE), u3 → 10 hrs ago (ACTIVE)
    let call = 0;
    ActivityLog.findOne = jest.fn().mockImplementation(() => ({
      sort: jest.fn().mockResolvedValue(
        call++ === 1
          ? { timestamp: hoursAgo(100), group_id: 'grp1' }
          : { timestamp: hoursAgo(5),   group_id: 'grp1' }
      ),
    }));

    UserStatus.findOne = jest.fn().mockResolvedValue(null);
    UserStatus.findOneAndUpdate = jest.fn().mockImplementation(
      (_f, update) => Promise.resolve(update)
    );

    const result = await service.getGroupStatus('grp1');

    expect(result.total_students).toBe(3);
    expect(result.active_students).toBe(2);
    expect(result.inactive_students).toBe(1);
    expect(result.students).toHaveLength(3);
  });

  test('throws if group not found', async () => {
    Group.findById = jest.fn().mockResolvedValue(null);
    await expect(service.getGroupStatus('badId')).rejects.toThrow('Group not found');
  });

});

// ─── 4. FULL FLOW SIMULATION ──────────────────────────────────────────────────

describe('Full flow — Module 5 logs → Module 6 picks up', () => {

  test('student sends a message (Module 5 logs it) → Module 6 classifies as ACTIVE', async () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    ActivityLog.findOne = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue({
        timestamp: tenMinutesAgo,
        group_id: 'grp42',
        activity_type: 'MESSAGE',
      }),
    });
    mockUpsert();

    const result = await service.getStudentStatus('activeUser');
    expect(result.status).toBe('ACTIVE');
    expect(new Date(result.last_active_at).getTime())
      .toBeCloseTo(tenMinutesAgo.getTime(), -3);
  });

  test('student goes silent for 97 hrs → status flips to INACTIVE', async () => {
    const wasActive = { status: 'ACTIVE', transition_count: 0, status_changed_at: null };

    ActivityLog.findOne = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue({
        timestamp: hoursAgo(97), // over 96hr → INACTIVE
        group_id: 'grp42',
      }),
    });
    UserStatus.findOne = jest.fn().mockResolvedValue(wasActive);
    UserStatus.findOneAndUpdate = jest.fn().mockImplementation(
      (_f, update) => Promise.resolve(update)
    );

    const result = await service.getStudentStatus('silentUser');
    expect(result.status).toBe('INACTIVE');
    expect(result.transition_count).toBe(1);
  });

});

// ─── 5. ACCESS CONTROL ───────────────────────────────────────────────────────

describe('RBAC — who can call /status/* endpoints', () => {

  const allowRoles = require('../api-gateway/src/middleware/rbac');

  function makeReqRes(role) {
    const req = { user: { role } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    return { req, res, next };
  }

  test('ADMIN can access status endpoints', () => {
    const { req, res, next } = makeReqRes('ADMIN');
    allowRoles('ADMIN', 'MANAGER')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('MANAGER can access status endpoints', () => {
    const { req, res, next } = makeReqRes('MANAGER');
    allowRoles('ADMIN', 'MANAGER')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('STUDENT is blocked — 403 Forbidden', () => {
    const { req, res, next } = makeReqRes('STUDENT');
    allowRoles('ADMIN', 'MANAGER')(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Access denied' })
    );
  });

  test('unknown role is also blocked', () => {
    const { req, res, next } = makeReqRes('GUEST');
    allowRoles('ADMIN', 'MANAGER')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

});