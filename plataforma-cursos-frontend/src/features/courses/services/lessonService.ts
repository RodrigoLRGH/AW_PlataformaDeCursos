import api from '../../../shared/utils/axiosInstance';
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
        const response = await api.get(`/courses/${courseId}/lessons`);
        return response.data;
    },

    getOne: async (courseId: number, id: string) => {
        const response = await api.get(`/courses/${courseId}/lessons/${id}`);
        return response.data;
    },

    create: async (courseId: number, payload: CreateLessonPayload) => {
        const response = await api.post(`/courses/${courseId}/lessons`, payload);
        return response.data;
    },

    update: async (courseId: number, id: string, payload: Partial<CreateLessonPayload>) => {
        const response = await api.put(`/courses/${courseId}/lessons/${id}`, payload);
        return response.data;
    },

    remove: async (courseId: number, id: string) => {
        await api.delete(`/courses/${courseId}/lessons/${id}`);
    },

}