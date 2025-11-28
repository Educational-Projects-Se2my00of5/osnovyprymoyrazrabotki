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
