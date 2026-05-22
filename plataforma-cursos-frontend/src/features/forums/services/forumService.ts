import api from '../../../shared/utils/axiosInstance';

export interface ForumThread {
    id: string;
    title: string;
    body: string;
    courseId: string;
    authorId: string;
    isPinned: boolean;
    isClosed: boolean;
    createdAt: Date;
    author: {
        id: number;
        firstName: string;
        lastName: string;
    }
    replies?: ForumReply[];
}

export interface ForumReply {
    id: string;
    body: string;
    threadId: string;
    authorId: string;
    createdAt: Date;
    author?: {
        id: number;
        firstName: string;
        lastName: string;
    }
}

export const forumService = {
    getThreadsByCourse: async (courseId: number) => {
        const response = await api.get(`/forums/courses/${courseId}`)
        return response.data
    },

    getThread: async (threadId: string) => {
        const response = await api.get(`/forums/threads/${threadId}`);
        return response.data;
    },

    createThread: async (data: { title: string, body: string; courseId: number }) => {
        const response = await api.post(`/forums/threads`, data);
        return response.data;
    },

    createReply: async (threadId: string, body: string) => {
        const response = await api.post(`/forums/threads/${threadId}/replies`, { body });
        return response.data;
    },
}