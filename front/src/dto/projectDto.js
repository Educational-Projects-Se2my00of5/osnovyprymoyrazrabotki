// DTO-фабрики для запросов и ответов, связанных с проектами
export function CreateProjectDto({ name, description, subjectName }) {
    return { name, description, subjectName };
}

export function UpdateProjectDto({ id, name, description, subjectName }) {
    return { id, name, description, subjectName };
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
