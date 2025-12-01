import { apiClient } from '../api';
import { TaskStatsDto } from '../dto/taskDto';
import { normalizeAxiosError } from '../utils/errorUtils';

export async function getTaskStats() {
  try {
    const resp = await apiClient.get('/tasks/stats');
    return TaskStatsDto(resp.data);
  } catch (err) {
    const { message } = normalizeAxiosError(err);
    throw new Error(message);
  }
}
