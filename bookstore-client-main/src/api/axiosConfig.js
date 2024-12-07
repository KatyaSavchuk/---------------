import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 5000,
});

// Добавляем интерсептор запросов для добавления токена
axiosInstance.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (tokens) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем интерсептор ответов для обработки ошибок 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Проверяем, что это ошибка 401 и что это не повторяющийся запрос
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Получаем refresh токен
      const tokens = JSON.parse(localStorage.getItem('tokens'));

      if (tokens) {
        try {
          // Обновляем токен
          const response = await axios.post('http://localhost:8000/api/token/refresh/', {
            refresh: tokens.refresh,
          });

          // Обновляем токены в localStorage
          localStorage.setItem('tokens', JSON.stringify(response.data));

          // Обновляем заголовок Authorization
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

          // Повторяем оригинальный запрос
          return axiosInstance(originalRequest);
        } catch (err) {
          // Не удалось обновить токен, разлогиниваем пользователя
          localStorage.removeItem('tokens');
          window.location.href = '/login';
          return Promise.reject(err);
        }
      } else {
        // Нет refresh токена, перенаправляем на страницу логина
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;