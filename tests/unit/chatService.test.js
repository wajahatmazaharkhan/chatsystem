// tests/unit/chatService.test.js
const axios = require('axios');
jest.mock('axios');

// Mock Mongoose models
jest.mock('../../schema/Message', () => ({
  create: jest.fn(),
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../schema/ActivityLog');
jest.mock('../../schema/UserStatus');

const Message = require('../../schema/Message');
const chatService = require('../../services/chatService');

describe('Chat Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GROUP_SERVICE_URL;
    delete process.env.STATUS_SERVICE_URL;
    delete process.env.ANALYTICS_SERVICE_URL;
  });

  test('sendMessage saves message and updates status locally when services unavailable', async () => {
    const fakeMessage = { _id: 'msg123', group_id: 'g1', sender_id: 'u1', content: 'Hello' };
    Message.create.mockResolvedValue(fakeMessage);
    const data = { group_id: 'g1', sender_id: 'u1', content: 'Hello' };

    const result = await chatService.sendMessage(data);
    expect(Message.create).toHaveBeenCalledWith(data);
    expect(result).toBe(fakeMessage);
    // No external service calls, ensure local status update called via helper (cannot directly test private function)
  });

  test('sendMessage calls external services when URLs are set', async () => {
    process.env.GROUP_SERVICE_URL = 'http://localhost:3002/groups/{group_id}/members';
    process.env.STATUS_SERVICE_URL = 'http://localhost:3004/status/update';
    process.env.ANALYTICS_SERVICE_URL = 'http://localhost:3005/analytics';

    const fakeMessage = { _id: 'msg123', group_id: 'g1', sender_id: 'u1', content: 'Hello' };
    Message.create.mockResolvedValue(fakeMessage);
    // Mock axios post for activity, status, analytics
    axios.post.mockResolvedValue({ data: {} });

    const data = { group_id: 'g1', sender_id: 'u1', content: 'Hello' };
    const result = await chatService.sendMessage(data);
    expect(Message.create).toHaveBeenCalled();
    // Expect three axios.post calls (activity, status, analytics)
    expect(axios.post).toHaveBeenCalledTimes(3);
    expect(result).toBe(fakeMessage);
  });

  test('getMessages retrieves sorted messages', async () => {
    const mockFind = { sort: jest.fn().mockResolvedValue(['msg1', 'msg2']) };
    Message.find = jest.fn().mockReturnValue(mockFind);
    const msgs = await chatService.getMessages('g1');
    expect(Message.find).toHaveBeenCalledWith({ group_id: 'g1' });
    expect(mockFind.sort).toHaveBeenCalledWith({ sent_at: -1 });
    expect(msgs).toEqual(['msg1', 'msg2']);
  });
});
