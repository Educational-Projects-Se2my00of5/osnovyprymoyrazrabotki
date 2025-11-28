import { apiClient } from '../api';
import { clearAuth, getRefreshToken } from './storage';
import { BothTokensResponseDto, LoginDto, LogoutDto, RegisterDto } from '../dto/authDto';
import { normalizeAxiosError } from '../utils/errorUtils';

export const login = async (email, password) => {
    try {
        const payload = LoginDto(email, password);
        const response = await apiClient.post('/auth/login', payload);

        return BothTokensResponseDto(response.data);
    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
};

export const register = async (email, password, firstName, lastName) => {
    try {
        const payload = RegisterDto(email, password, firstName, lastName);
        await apiClient.post('/auth/register', payload);

    } catch (err) {
        const { message } = normalizeAxiosError(err);
        throw new Error(message);
    }
};

export const logout = async () => {
    const refreshToken = getRefreshToken();

    try {
        if (refreshToken) {
            const payload = LogoutDto(refreshToken);
            await apiClient.post('/auth/logout', payload);
        }
    } catch (error) {
        console.error('Ошибка при выходе:', normalizeAxiosError(error).message);
    } finally {
        clearAuth();
    }
};
