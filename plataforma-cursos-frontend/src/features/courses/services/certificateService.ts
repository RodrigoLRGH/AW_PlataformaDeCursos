import api from '../../../shared/utils/axiosInstance';

export interface Certificate {
    id: string;
    courseId: number;
    certificateCode: string;
    issuedAt: Date;
    course: {
        id: number;
        title: string;
    }
}

export const certificateService = {
    generate: async (courseId: number) => {
        const response = await api.post(`/certificates/courses/${courseId}`);
        return response.data;
    },

    getMyCertificates: async () => {
        const response = await api.get(`/certificates/my`);
        return response.data;
    },

    download: async (certId: string) => {
        const response = await api.get(`/certificates/${certId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },
}