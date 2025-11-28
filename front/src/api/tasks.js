import { apiClient } from '../api';
import { TaskStatsDto } from '../dto/taskDto';

export async function getTaskStats() {
  const resp = await apiClient.get('/tasks/stats');
  return TaskStatsDto(resp.data);
}
