// DTO-фабрики для запросов и ответов, связанных с проектами
export function CreateProjectDto(name, description, subjectName) {
    return { name, description, subjectName };
}

export function UpdateProjectDto(name, description, subjectName, status) {
    return { name, description, subjectName, status };
}

export function AddMemberDto(userId, role) {
    return { userId, role };
}

export function ProjectSummaryDto(data) {
    if (!data) return null;
    return {
        id: data.id,
        name: data.name,
        subjectName: data.subjectName,
        status: data.status,
        role: data.role,
        createdAt: data.createdAt,
    };
}

export function TeamMemberInfoDto(data) {
    if (!data) return null;
    return {
        id: data.id,
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
    };
}

export function ProjectDetailsDto(data) {
    if (!data) return null;
    return {
        id: data.id,
        name: data.name,
        description: data.description,
        subjectName: data.subjectName,
        status: data.status,
        createdAt: data.createdAt,
        members: Array.isArray(data.members) ? data.members.map(TeamMemberInfoDto) : [],
        myRole: data.myRole,
    };
}

export function TaskTypeStatsDto(data) {
    if (!data) return { total: 0, closed: 0, overdue: 0 };
    return {
        total: data.total || 0,
        closed: data.closed || 0,
        overdue: data.overdue || 0,
    };
}

export function TaskStatsDto(data) {
    if (!data) return {
        assigned: { total: 0, closed: 0, overdue: 0 },
        all: { total: 0, closed: 0, overdue: 0 }
    };
    return {
        assigned: TaskTypeStatsDto(data.assigned),
        all: TaskTypeStatsDto(data.all),
    };
}
