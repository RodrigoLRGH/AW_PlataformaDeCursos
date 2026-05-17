import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export interface Course {
    id: number;
    title: string;
    description?: string;
    category?: string;
    level?: string;
    price: number;
    thumbnailUrl?: string;
    status: 'draft' | 'published' | 'archived';
    creatorId: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCoursePayload {
    title: string;
    description?: string;
    category?: string;
    level?: string;
    price: number;
    thumbnailUrl?: string;
}

export const courseService = {
    getAll: async (isPublished?: boolean) => {
        const params = isPublished ? { status: 'published' } : {};
        const response = await api.get<Course[]>(`/courses`, { params });
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<Course>(`/courses/${id}`);
        return response.data;
    },

    create: async (payload: CreateCoursePayload) => {
        const response = await api.post<Course>(`/courses`, payload);
        return response.data;
    },

    update: async (id: number, payload: Partial<CreateCoursePayload>) => {
        const response = await api.put<Course>(`/courses/${id}`, payload);
        return response.data;
    },

    remove: async (id: number) => {
        await api.delete(`/courses/${id}`);
    },

    getMyCourses: async () => {
        const response = await api.get(`/courses/my`);
        return response.data;
    },
};