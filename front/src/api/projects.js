import { apiClient } from '../api';
import { ProjectSummaryDto } from '../dto/projectDto';

export async function getProjects() {
    const resp = await apiClient.get('/projects');
    if (!resp || !resp.data) return [];
    return resp.data.map((p) => ProjectSummaryDto(p));
}

export async function createProject(payload) {
    const resp = await apiClient.post('/projects', payload);
    return ProjectSummaryDto(resp.data);
}
