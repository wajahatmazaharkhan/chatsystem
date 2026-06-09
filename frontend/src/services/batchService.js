import api from "./api";

export const createBatch=(payload)=>{
    return api.post("/batches", payload);
};

export const getAllBatches=()=>{
    return api.get("/batches");
};

export const getAvailableBatches=()=>{
    return api.get("/batches/available");
};

export const getEnrolledBatches=()=>{
    return api.get("/batches/enrolled");
};

export const enrollBatch=(batchId)=>{
    return api.post(`/batches/${batchId}/enroll`);
};

export const getBatchById=(id)=>{
    return api.get(`/batches/${id}`);
};

export const assignManager=(groupId,managerId)=>{
    return api.patch(`/batches/groups/${groupId}/manager`, {manager_id:managerId});
};