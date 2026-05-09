const {
    createGroup,
    getGroupById,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember
} = require('../../../services/groupServices');

const create = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access Denied: Admin only" });
        
        const group = await createGroup(req.body);
        return res.status(201).json({ status: "success", data: group });
    } catch (error) {
        next(error);
    }
};

const get = async (req, res, next) => {
    try {
        const group = await getGroupById(req.params.group_id);
        if (!group) return res.status(404).json({ error: "Group not found" });

        // Basic check to see if user is member or admin
        const isMember = group.members.some(id => id._id ? id._id.toString() === req.user.user_id.toString() : id.toString() === req.user.user_id.toString());
        if (req.user.role !== 'ADMIN' && !isMember) {
            return res.status(403).json({ error: "Access Denied" });
        }

        return res.status(200).json({ status: "success", data: group });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access Denied: Admin only" });

        const group = await updateGroup(req.params.group_id, req.body);
        if (!group) return res.status(404).json({ error: "Group not found" });
        return res.status(200).json({ status: "success", data: group });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access Denied: Admin only" });

        const group = await deleteGroup(req.params.group_id);
        if (!group) return res.status(404).json({ error: "Group not found" });
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const addGroupMember = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access Denied: Admin only" });

        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ error: "user_id is required" });

        const group = await addMember(req.params.group_id, user_id);
        return res.status(200).json({ status: "success", data: group });
    } catch (error) {
        if (error.message === "User already a member" || error.message === "A group cannot have more than 7 members") {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
};

const removeGroupMember = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access Denied: Admin only" });

        const { member_id } = req.params;
        const group = await removeMember(req.params.group_id, member_id);
        return res.status(200).json({ status: "success", data: group });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    get,
    update,
    remove,
    addGroupMember,
    removeGroupMember
};
