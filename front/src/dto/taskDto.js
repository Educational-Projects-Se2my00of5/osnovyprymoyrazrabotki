// DTO-фабрика для статистики задач
export function TaskStatsDto(data) {
    if (!data) return { total: 0, closed: 0, overdue: 0 };

    return {
        total: data.total ?? 0,
        closed: data.closed ?? 0,
        overdue: data.overdue ?? 0,
    };
}
