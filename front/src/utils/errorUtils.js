// Утилита для нормализации ошибок axios в формат, который ожидает UI
export function normalizeAxiosError(err) {
    if (!err) return { message: 'Unknown error', status: null };

    const status = err.response?.status ?? null;
    const data = err.response?.data;

    let message = 'Unknown error';

    if (data) {
        if (typeof data === 'string') {
            message = data;
        } else if (data.message) {
            message = data.message;
        } else if (data.error) {
            message = data.error;
        } else {
            try {
                message = JSON.stringify(data);
            } catch (e) {
                message = String(data);
            }
        }
    } else if (err.message) {
        message = err.message;
    }

    return { message, status };
}
