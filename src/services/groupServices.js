const Group = require('../../schema/Group');

const createGroup = async (groupData) => {
    const group = new Group(groupData);
    await group.save();
    return group;
};

const getGroupById = async (groupId) => {
    return await Group.findById(groupId).populate('members', 'name email');
};

const updateGroup = async (groupId, updateData) => {
    return await Group.findByIdAndUpdate(groupId, updateData, { new: true, runValidators: true });
};

const deleteGroup = async (groupId) => {
    // Soft delete
    return await Group.findByIdAndUpdate(groupId, { deleted_at: new Date() }, { new: true });
};

const addMember = async (groupId, userId) => {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found");
    if (group.members.includes(userId)) throw new Error("User already a member");
    if (group.members.length >= 7) throw new Error("A group cannot have more than 7 members");

    group.members.push(userId);
    await group.save();
    return group;
};

const removeMember = async (groupId, userId) => {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found");

    group.members = group.members.filter(id => id.toString() !== userId.toString());
    await group.save();
    return group;
};

module.exports = {
    createGroup,
    getGroupById,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember
};
