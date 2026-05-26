import api from '../../../shared/utils/axiosInstance';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'student' | 'creator';
}

export const authService = {
    login: async (data: LoginPayload) => {
        const response = await api.post('/auth/login', data)
        return response.data
    },
    register: async (data: RegisterPayload) => {
        const response = await api.post('/auth/register', data)
        return response.data
    },
    logout: async () => {
        try {
            await api.post('/auth/logout')
        } catch {
        }
    },
    me: async () => {
        const response = await api.get('/auth/me')
        return response.data
    },
}