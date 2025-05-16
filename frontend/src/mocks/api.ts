import axios, { AxiosResponse } from 'axios';

// Мок API для разработки
if (process.env.NODE_ENV === 'development') {
    const mockDocuments: any[] = [];

    axios.interceptors.request.use((config) => {
        if (config.url?.startsWith('/api')) {
            console.log(`[API Mock] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    });

    axios.interceptors.response.use((response: AxiosResponse) => {
        if (response.config.url === '/api/documents') {
            return {
                ...response,
                data: mockDocuments
            };
        }
        return response;
    });
}

export { }; // Добавляем экспорт для isolatedModules