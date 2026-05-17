import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
    firstName: string; lastName: string;
    email: string; password: string;
    role: 'student' | 'creator';
}

export const authService = {
    login: async (payload: LoginPayload) => {
        const res = await axios.post(`${API_URL}/auth/login`, payload, { withCredentials: true });
        return res.data; // { user }
    },
    register: async (payload: RegisterPayload) => {
        const res = await axios.post(`${API_URL}/auth/register`, payload, { withCredentials: true });
        return res.data;
    },
    logout: async () => {
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    },
    refresh: async () => {
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        return res.data;
    },
    me: async () => {
        const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
        return res.data;
    },
};