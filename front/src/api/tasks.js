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

export async function createTask(projectId, taskData) {
    try {
        const resp = await apiClient.post(`/projects/${projectId}/tasks`, taskData);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getTask(taskId) {
    try {
        const resp = await apiClient.get(`/tasks/${taskId}`);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getProjectMembers(projectId) {
    try {
        const resp = await apiClient.get(`/projects/${projectId}/members/options`);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getProjectTasksOptions(projectId) {
    try {
        const resp = await apiClient.get(`/projects/${projectId}/tasks/options`);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getMyMemberId(projectId) {
    try {
        const resp = await apiClient.get(`/projects/${projectId}/members/me`);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function updateTask(taskId, taskData) {
    try {
        const resp = await apiClient.put(`/tasks/${taskId}`, taskData);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}
