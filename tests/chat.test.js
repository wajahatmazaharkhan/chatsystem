const request = require('supertest');
const nock = require('nock');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Message = require('../schema/Message');
const Group = require('../schema/Group');
const ActivityLog = require('../schema/ActivityLog');

// Set environment variables for testing integration paths
process.env.AUTH_VALIDATE_URL = 'http://auth-service/auth/validate';
process.env.GROUP_SERVICE_URL = 'http://group-service/groups/{id}/members';
process.env.ACTIVITY_SERVICE_URL = 'http://activity-service/activity/log';

// Mock Mongoose schemas
jest.mock('../schema/Message', () => {
  return {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn(),
  };
});

jest.mock('../schema/Group', () => {
  return {
    findById: jest.fn(),
  };
});

jest.mock('../schema/ActivityLog', () => {
  return {
    create: jest.fn(),
  };
});

describe('Chat System Integration Tests', () => {
  const token = 'Bearer ' + jwt.sign({ user_id: 'user123', role: 'STUDENT' }, 'secret');
  const adminToken = 'Bearer ' + jwt.sign({ user_id: 'admin123', role: 'ADMIN' }, 'secret');
  const validGroupId = '60d07f613116a41f681a5c43';
  const invalidGroupId = 'invalid-id';

  beforeEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Authentication Middleware
  // ─────────────────────────────────────────────────────────────────────────
  describe('Authentication Middleware', () => {
    it('should return 401 if Authorization header is missing', async () => {
      const res = await request(app)
        .post('/v1/chat/send')
        .send({ group_id: validGroupId, content: 'Hello' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Missing or invalid authorization header');
    });

    it('should return 401 if Auth service validation fails', async () => {
      nock('http://auth-service')
        .post('/auth/validate')
        .reply(401, { error: 'Invalid token' });

      const res = await request(app)
        .post('/v1/chat/send')
        .set('Authorization', token)
        .send({ group_id: validGroupId, content: 'Hello' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Group Membership Validation
  // ─────────────────────────────────────────────────────────────────────────
  describe('Group Membership Validation', () => {
    it('should return 400 for invalid group_id format', async () => {
      nock('http://auth-service')
        .post('/auth/validate')
        .reply(200, { user_id: 'user123', role: 'STUDENT' });

      const res = await request(app)
        .post('/v1/chat/send')
        .set('Authorization', token)
        .send({ group_id: invalidGroupId, content: 'Hello' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid group_id format');
    });

    it('should return 403 if user does not belong to the group', async () => {
      nock('http://auth-service')
        .post('/auth/validate')
        .reply(200, { user_id: 'user123', role: 'STUDENT' });

      nock('http://group-service')
        .get(`/groups/${validGroupId}/members`)
        .reply(200, { members: ['user456', 'user789'], manager_id: 'manager123' });

      const res = await request(app)
        .post('/v1/chat/send')
        .set('Authorization', token)
        .send({ group_id: validGroupId, content: 'Hello' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Access denied');
    });

    it('should bypass validation and pass if user is an ADMIN', async () => {
      nock('http://auth-service')
        .post('/auth/validate')
        .reply(200, { user_id: 'admin123', role: 'ADMIN' });

      Message.create.mockResolvedValue({
        _id: 'msg123',
        group_id: validGroupId,
        sender_id: 'admin123',
        content: 'Hello Admin',
        sent_at: new Date(),
      });

      nock('http://activity-service')
        .post('/activity/log')
        .reply(200, { success: true });

      const res = await request(app)
        .post('/v1/chat/send')
        .set('Authorization', adminToken)
        .send({ group_id: validGroupId, content: 'Hello Admin' });

      expect(res.status).toBe(201);
      expect(Message.create).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // POST /v1/chat/send
  // ─────────────────────────────────────────────────────────────────────────
  describe('POST /v1/chat/send', () => {
    it('should send a message successfully when user is a group member', async () => {
      nock('http://auth-service')
        .post('/auth/validate')
        .reply(200, { user_id: 'user123', role: 'STUDENT' });

      nock('http://group-service')
        .get(`/groups/${validGroupId}/members`)
        .reply(200, { members: ['user123', 'user456'] });

      const mockMessage = {
        _id: 'msg_success_123',
        group_id: validGroupId,
        sender_id: 'user123',
        content: 'Hello Group',
        sent_at: new Date(),
      };
      Message.create.mockResolvedValue(mockMessage);

      nock('http://activity-service')
        .post('/activity/log')
        .reply(200, { success: true });

      const res = await request(app)
        .post('/v1/chat/send')
        .set('Authorization', token)
        .send({ group_id: validGroupId, content: 'Hello Group' });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe('Hello Group');
      expect(Message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          group_id: validGroupId,
          sender_id: 'user123',
          content: 'Hello Group',
        })
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /v1/chat/:groupId
  // ─────────────────────────────────────────────────────────────────────────
  describe('GET /v1/chat/:groupId', () => {
    it('should retrieve messages successfully for group member', async () => {
      nock('http://auth-service')
        .post('/auth/validate')
        .reply(200, { user_id: 'user123', role: 'STUDENT' });

      nock('http://group-service')
        .get(`/groups/${validGroupId}/members`)
        .reply(200, { members: ['user123', 'user456'] });

      const mockMessages = [
        { group_id: validGroupId, sender_id: 'user456', content: 'Hi user123' },
        { group_id: validGroupId, sender_id: 'user123', content: 'Hi there' },
      ];
      Message.sort.mockResolvedValue(mockMessages);

      const res = await request(app)
        .get(`/v1/chat/${validGroupId}`)
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].content).toBe('Hi user123');
    });

    it('should reject access if user is not in the group', async () => {
      nock('http://auth-service')
        .post('/auth/validate')
        .reply(200, { user_id: 'user999', role: 'STUDENT' });

      nock('http://group-service')
        .get(`/groups/${validGroupId}/members`)
        .reply(200, { members: ['user123', 'user456'] });

      const res = await request(app)
        .get(`/v1/chat/${validGroupId}`)
        .set('Authorization', 'Bearer ' + jwt.sign({ user_id: 'user999', role: 'STUDENT' }, 'secret'));

      expect(res.status).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Local DB Fallbacks (when no microservice URLs configured)
  // ─────────────────────────────────────────────────────────────────────────
  describe('Local DB Fallbacks', () => {
    it('should fall back to local DB if services are not configured', async () => {
      delete process.env.AUTH_VALIDATE_URL;
      delete process.env.GROUP_SERVICE_URL;
      delete process.env.ACTIVITY_SERVICE_URL;

      Group.findById.mockResolvedValue({
        _id: validGroupId,
        members: ['user123', 'user456'],
      });

      Message.create.mockResolvedValue({
        _id: 'local_msg_123',
        group_id: validGroupId,
        sender_id: 'user123',
        content: 'Hello Local',
      });

      ActivityLog.create.mockResolvedValue({ success: true });

      const res = await request(app)
        .post('/v1/chat/send')
        .set('Authorization', token)
        .send({ group_id: validGroupId, content: 'Hello Local' });

      expect(res.status).toBe(201);
      expect(Group.findById).toHaveBeenCalledWith(validGroupId);
      expect(ActivityLog.create).toHaveBeenCalled();

      // Restore
      process.env.AUTH_VALIDATE_URL = 'http://auth-service/auth/validate';
      process.env.GROUP_SERVICE_URL = 'http://group-service/groups/{id}/members';
      process.env.ACTIVITY_SERVICE_URL = 'http://activity-service/activity/log';
    });
  });
});
