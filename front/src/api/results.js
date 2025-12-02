import { apiClient } from '../api';
import { normalizeAxiosError } from '../utils/errorUtils';

export async function getAllMyResults() {
    try {
        const resp = await apiClient.get('/results/my');
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getProjectResults(projectId) {
    try {
        const resp = await apiClient.get(`/projects/${projectId}/results`);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getMyResultsInProject(projectId) {
    try {
        const resp = await apiClient.get(`/projects/${projectId}/results/my`);
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getMemberResults(projectId, memberId) {
    try {
        const resp = await apiClient.get(`/projects/${projectId}/results/member/${memberId}`);
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
