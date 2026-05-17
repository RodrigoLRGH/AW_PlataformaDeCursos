import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export interface Lesson {
    id: string;
    title: string;
    description?: string;
    contentUrl?: string;
    order: number;
    durationMinutes?: number;
    courseId: number;
}

export interface CreateLessonPayload {
    title: string;
    description?: string;
    contentUrl?: string;
    order?: number;
    durationMinutes?: number;
}

export const lessonService = {
    getByCourse: async (courseId: number) => {
        const response = await api.get(`${API_URL}/courses/${courseId}/lessons`);
        return response.data;
    },

    getOne: async (courseId: number, id: string) => {
        const response = await api.get(`${API_URL}/courses/${courseId}/lessons/${id}`);
        return response.data;
    },

    create: async (courseId: number, payload: CreateLessonPayload) => {
        const response = await api.post(`${API_URL}/courses/${courseId}/lessons`, payload);
        return response.data;
    },

    update: async (courseId: number, id: string, payload: Partial<CreateLessonPayload>) => {
        const response = await api.put(`${API_URL}/courses/${courseId}/lessons/${id}`, payload);
        return response.data;
    },

    remove: async (courseId: number, id: string) => {
        await api.delete(`${API_URL}/courses/${courseId}/lessons/${id}`);
    },

}