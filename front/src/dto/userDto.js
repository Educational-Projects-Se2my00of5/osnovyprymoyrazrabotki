// DTO для ответа с информацией о пользователе, соответствует backend `UserDto.UserInfo`
export function UserInfoDto(data) {
    if (!data) return null;
    return {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        registrationDate: data.registrationDate,
    };
}

export function UpdateUserRequestDto(firstName, lastName) {
    return {
        firstName: firstName,
        lastName: lastName,
    };
}

export function PageDto(data, itemMapper = (item) => item) {
    if (!data) return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 0,
    };
    return {
        content: Array.isArray(data.content) ? data.content.map(itemMapper) : [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        number: data.number || 0,
        size: data.size || 0,
    };
}
