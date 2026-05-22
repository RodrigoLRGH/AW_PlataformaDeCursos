import api from '../../../shared/utils/axiosInstance';
export interface Enrollment {
    id: string;
    courseId: number;
    userId: number;
    progressPercentage: number;
    completedAt?: Date | null;
    enrolledAt: Date;
    course?: {
        id: number;
        title: string;
        thumbnailUrl?: string;
    };
}

export const enrollmentService = {
    enroll: async (courseId: number) => {
        const response = await api.post(`/enrollments`, { courseId });
        return response.data;
    },

    getMyEnrollments: async () => {
        const response = await api.get(`/enrollments/my`);
        return response.data;
    },

    checkEnrollment: async (courseId: number) => {
        const response = await api.get(`/enrollments/check/${courseId}`);
        return response.data;
    },
}