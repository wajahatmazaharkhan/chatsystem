const axios = require('axios');

// Ensures the student belongs to the group before allowing chat interaction
const checkGroupAccess = async (req, res, next) => {
    const groupId = req.params.group_id || req.body.group_id;
    const { user_id, role } = req.user;

    //Admins have direct access to all groups
    if (role === 'ADMIN') return next();

    try {
        // Module 3 Integration Point: /groups/{id}/members 
        const response = await axios.get(`http://group-service/groups/${groupId}/members`);
        const members = response.data.members; // Expecting array of User IDs 

        if (!members.includes(user_id)) {
            return res.status(403).json({ error: "Access Denied: You are not a member of this group" });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({ error: "Failed to verify group membership" });
    }
};

module.exports = checkGroupAccess;