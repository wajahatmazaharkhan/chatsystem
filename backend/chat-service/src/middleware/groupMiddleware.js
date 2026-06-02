const axios = require('axios');

const checkGroupAccess = async (req, res, next) => {
  const groupId = req.params.group_id || req.body.group_id;
  const { user_id, role } = req.user;

  if (!groupId) {
    return res.status(400).json({
      error: 'group_id is required'
    });
  }

  // Admin bypass
  if (role === 'ADMIN') {
    return next();
  }

  try {
    const response = await axios.get(
      `${process.env.GROUP_SERVICE_URL}/groups/${groupId}/members/validate`,
      {
        params: {
          user_id
        },
        headers: {
          Authorization: req.headers.authorization
        }
      }
    );

    if (!response.data.belongs_to_group) {
    return res.status(403).json({
        error: 'Access Denied: You are not a member of this group'
    });
    }

    next();
  } catch (error) {

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Group not found'
      });
    }

    console.error(
      'Group membership validation failed:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      error: 'Failed to verify group membership'
    });
  }
};

module.exports = checkGroupAccess;