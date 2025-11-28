// DTO-фабрики для запросов, связанных с проектами
// Пока здесь заглушки — добавляйте конкретные поля по мере роста требований
export function CreateProjectDto({ title, description }) {
    return { title, description };
}

export function UpdateProjectDto({ id, title, description }) {
    return { id, title, description };
}
