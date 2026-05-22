import api from '../../../shared/utils/axiosInstance';

export interface LessonProgress {
    lessonId: string;
    title: string;
    completed: boolean;
}

export const progressService = {
    markComplete: async (lessonId: string) => {
        const response = await api.post(`/progress/lessons/${lessonId}/complete`);
        return response.data;
    },

    getCourseProgress: async (courseId: number) => {
        const response = await api.get(`/progress/courses/${courseId}`);
        return response.data;
    },
}