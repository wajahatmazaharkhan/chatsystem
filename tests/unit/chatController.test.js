// tests/unit/chatController.test.js
const chatController = require('../../controllers/chatController');
const chatService = require('../../services/chatService');

jest.mock('../../services/chatService');

describe('Chat Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      headers: {},
      user: { user_id: 'user123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('sendMessage', () => {
    test('should send message successfully and return 201', async () => {
      req.body = { group_id: 'group123', content: 'Hello Controller' };
      req.headers.authorization = 'Bearer token123';
      const mockResult = { _id: 'msg123', content: 'Hello Controller' };
      chatService.sendMessage.mockResolvedValue(mockResult);

      await chatController.sendMessage(req, res, next);

      expect(chatService.sendMessage).toHaveBeenCalledWith(
        { group_id: 'group123', content: 'Hello Controller', sender_id: 'user123' },
        'Bearer token123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    test('should return 400 when chatService.sendMessage throws an error', async () => {
      req.body = { group_id: 'group123', content: 'Hello Controller' };
      chatService.sendMessage.mockRejectedValue(new Error('Validation failed'));

      await chatController.sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed' });
    });
  });

  describe('getMessages', () => {
    test('should retrieve messages successfully and return 200', async () => {
      req.params.groupId = 'group123';
      const mockMessages = [{ _id: 'msg1', content: 'hello' }];
      chatService.getMessages.mockResolvedValue(mockMessages);

      await chatController.getMessages(req, res, next);

      expect(chatService.getMessages).toHaveBeenCalledWith('group123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    test('should return 400 when chatService.getMessages throws an error', async () => {
      req.params.groupId = 'group123';
      chatService.getMessages.mockRejectedValue(new Error('Database error'));

      await chatController.getMessages(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
});
