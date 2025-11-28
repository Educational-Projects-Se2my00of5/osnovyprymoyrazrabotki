import { apiClient } from '../api';
import { UserInfoDto, UpdateUserRequestDto } from '../dto/userDto';
import { normalizeAxiosError } from '../utils/errorUtils';

// Получение профиля текущего пользователя — сервер берет user из Authorization header.
export const getProfile = async () => {
  try {
    const response = await apiClient.get('/user/me');
    return UserInfoDto(response.data);
  } catch (err) {
    const { message } = normalizeAxiosError(err);
    throw new Error(message);
  }
};

export const updateProfile = async ({ firstName, lastName }) => {
  try {
    const payload = UpdateUserRequestDto(firstName, lastName);
    const response = await apiClient.put('/user/me', payload);
    return UserInfoDto(response.data);
  } catch (err) {
    const { message } = normalizeAxiosError(err);
    throw new Error(message);
  }
};