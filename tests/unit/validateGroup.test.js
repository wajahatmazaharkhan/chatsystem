// tests/unit/validateGroup.test.js
const axios = require('axios');
jest.mock('axios');

// Mock Group schema
jest.mock('../../schema/Group', () => ({
  findById: jest.fn(),
}));

const Group = require('../../schema/Group');
const validateGroupMember = require('../../middleware/validateGroup');

const mockRequest = (user, params = {}, body = {}, headers = {}) => ({
  user,
  params,
  body,
  headers,
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const nextFunction = jest.fn();

describe('ValidateGroup Middleware Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    nextFunction.mockClear();
  });

  test('ADMIN bypasses group validation', async () => {
    const req = mockRequest({ user_id: 'admin1', role: 'ADMIN' }, {}, {});
    const res = mockResponse();
    await validateGroupMember(req, res, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  test('returns 400 when group_id missing', async () => {
    const req = mockRequest({ user_id: 'u1', role: 'STUDENT' }, {}, {});
    const res = mockResponse();
    await validateGroupMember(req, res, nextFunction);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'group_id is required' });
  });

  test('uses external service when URL configured and passes membership', async () => {
    process.env.GROUP_SERVICE_URL = 'http://localhost:3002/groups/{group_id}/members';
    const members = [{ user_id: 'u1' }, { user_id: 'u2' }];
    axios.get.mockResolvedValue({ data: members });
    const req = mockRequest({ user_id: 'u1', role: 'STUDENT' }, {}, { group_id: '60d07f613116a41f681a5c43' }, { authorization: 'Bearer token' });
    const res = mockResponse();
    await validateGroupMember(req, res, nextFunction);
    expect(axios.get).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
    delete process.env.GROUP_SERVICE_URL;
  });

  test('falls back to DB when service fails and validates member', async () => {
    process.env.GROUP_SERVICE_URL = 'http://invalid';
    axios.get.mockRejectedValue(new Error('Network Error'));
    const mockGroup = { members: ['u1', 'u2'], manager_id: 'u3' };
    Group.findById.mockResolvedValue(mockGroup);
    const req = mockRequest({ user_id: 'u2', role: 'STUDENT' }, {}, { group_id: '60d07f613116a41f681a5c44' });
    const res = mockResponse();
    await validateGroupMember(req, res, nextFunction);
    expect(Group.findById).toHaveBeenCalledWith('60d07f613116a41f681a5c44');
    expect(nextFunction).toHaveBeenCalled();
    delete process.env.GROUP_SERVICE_URL;
  });
});

