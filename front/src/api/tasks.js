import { apiClient } from '../api';
import { normalizeAxiosError } from '../utils/errorUtils';

export async function getAllMyTasks() {
    try {
        const resp = await apiClient.get('/tasks/my');
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getProjectTasks(projectId) {
    try {
        const resp = await apiClient.get(`/projects/${projectId}/tasks`);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getMyTasksInProject(projectId) {
    try {
        const resp = await apiClient.get(`/projects/${projectId}/tasks/my`);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getMemberTasks(projectId, memberId) {
    try {
        const resp = await apiClient.get(`/projects/${projectId}/tasks/member/${memberId}`);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getTaskStats() {
    try {
        const resp = await apiClient.get('/tasks/stats');
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function updateMemberRole(projectId, memberId, newRole) {
    try {
        await apiClient.put(`/projects/${projectId}/members/${memberId}/role`, newRole, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}
