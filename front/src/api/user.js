import { apiClient } from '../api';
import { UserInfoDto } from '../dto/userDto';
import { normalizeAxiosError } from '../utils/errorUtils';

// Получение профиля текущего пользователя — сервер берет user из Authorization header.
export const getProfile = async () => {
  try {
    const response = await apiClient.get('/user/me');
    return  UserInfoDto(response.data);
  } catch (err) {
    const { message } = normalizeAxiosError(err);
    throw new Error(message);
  }
};