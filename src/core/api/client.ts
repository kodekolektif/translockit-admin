import axios from 'axios';

// Base URL for the API
export const API_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Setup Request Interceptor for Bearer Token
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Global error normalization logic
apiClient.interceptors.response.use(
    (response) => {
        if (typeof response.data === 'string') {
            const jsonStart = response.data.indexOf('{');
            if (jsonStart !== -1) {
                try {
                    response.data = JSON.parse(response.data.substring(jsonStart));
                } catch (e) { }
            }
        }
        return response;
    },
    (error) => {
        if (error.response && typeof error.response.data === 'string') {
            const jsonStart = error.response.data.indexOf('{');
            if (jsonStart !== -1) {
                try {
                    error.response.data = JSON.parse(error.response.data.substring(jsonStart));
                } catch (e) { }
            }
        }
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
