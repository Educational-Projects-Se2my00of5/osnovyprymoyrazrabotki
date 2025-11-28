// DTO-фабрики для auth-запросов
export function LoginDto(email, password) {
    return { email, password };
}

export function RegisterDto(email, password, firstName, lastName) {
    return { email, password, firstName, lastName };
}

export function RefreshDto(refreshToken) {
    return { refreshToken };
}

export function LogoutDto(refreshToken) {
    return { refreshToken };
}

// Response DTO: оба токена (access + refresh)
export function BothTokensResponseDto(data) {
    if (!data) return null;
    return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
    };
}
