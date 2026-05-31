import api from "./api";

export const getAllGroups=()=>{

    return api.get('/groups');

};


export const getGroupById=(groupId)=>{

    return api.get(`/groups/${groupId}`);

};


export const getGroupMembers=(groupId)=>{

    return api.get(`/groups/${groupId}/members`);

};


export const validateMember=(groupId)=>{

    return api.get(`/groups/${groupId}/members/validate`);

};