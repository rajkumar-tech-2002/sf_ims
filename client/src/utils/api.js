import axios from "axios";

const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // Crucial for sending cookies
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Session expired, redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;