import axios from 'axios';
import { getAccessToken } from './auth';

export const api = axios.create({
    baseURL: 'https://back-end-ainya.vercel.app/api/',
    headers: {
        'Content-Type': 'application/json',
    }
})

api.interceptors.request.use((config) =>  {
    const token = getAccessToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});