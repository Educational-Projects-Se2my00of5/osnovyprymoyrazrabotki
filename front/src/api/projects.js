import { apiClient } from '../api';
import { 
    ProjectSummaryDto, 
    ProjectDetailsDto, 
    CreateProjectDto, 
    UpdateProjectDto, 
    AddMemberDto,
    TaskStatsDto 
} from '../dto/projectDto';
import { normalizeAxiosError } from '../utils/errorUtils';

export async function getProjects() {
    try {
        const resp = await apiClient.get('/projects');
        if (!resp || !resp.data) return [];
        return resp.data.map((p) => ProjectSummaryDto(p));
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function createProject(name, description, subjectName, deadline) {
    try {
        const payload = CreateProjectDto(name, description, subjectName, deadline);
        const resp = await apiClient.post('/projects', payload);
        return ProjectSummaryDto(resp.data);
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getProject(id) {
    try {
        const resp = await apiClient.get(`/projects/${id}`);
        if (!resp || !resp.data) return null;
        return ProjectDetailsDto(resp.data);
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function updateProject(id, name, description, subjectName, status, deadline) {
    try {
        const payload = UpdateProjectDto(name, description, subjectName, status, deadline);
        const resp = await apiClient.put(`/projects/${id}`, payload);
        return ProjectDetailsDto(resp.data);
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getProjectTaskStats(id) {
    try {
        const resp = await apiClient.get(`/projects/${id}/tasks/stats`);
        return TaskStatsDto(resp.data);
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function getAvailableUsers(id, page = 0, size = 20) {
    try {
        const resp = await apiClient.get(`/projects/${id}/available-users`, {
            params: { page, size }
        });
        return resp.data;
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function addMemberToProject(id, userId, role) {
    try {
        const payload = AddMemberDto(userId, role);
        await apiClient.post(`/projects/${id}/members`, payload);
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function removeMemberFromProject(id, memberId) {
    try {
        await apiClient.delete(`/projects/${id}/members/${memberId}`);
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}

export async function deleteProject(id) {
    try {
        await apiClient.delete(`/projects/${id}`);
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
}
