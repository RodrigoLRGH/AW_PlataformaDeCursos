import api from '../../../shared/utils/axiosInstance';

export interface ExamQuestion {
    id: string;
    question: string;
    options: string[];
    order: number;
    points: number;
}

export interface Exam {
    id: string;
    title: string;
    courseId: string;
    passingScore: number;
    timeLimitMinutes?: number;
    questions?: ExamQuestion[];
}

export interface ExamResult {
    id: string;
    score: number;
    isPassed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    submittedAt: Date;
}

export interface CreateExamPayload {
    title: string;
    passingScore?: number;
    timeLimitMinutes?: number;
    questions: {
        question: string;
        options: string[];
        points: number;
        order?: number;
        correctAnswer: number;
    }[];
}

export interface SubmitExamPayload {
    answers: { questionId: string; selectedOption: number }[]
}

export const examService = {
    // Crear examen para un curso
    create: async (courseId: number, data: CreateExamPayload) => {
        const response = await api.post(`/exams/courses/${courseId}`, data);
        return response.data
    },

    // Devuelve las preguntas de un examen sin las respuestas correctas
    getQuestions: async (examId: string) => {
        const response = await api.get(`/exams/${examId}/questions`);
        return response.data
    },

    // Enviar respuestas de un examen y obtener resultados
    submit: async (examId: string, data: SubmitExamPayload) => {
        const response = await api.post(`/exams/${examId}/submit`, data);
        return response.data
    },

    // Devuelve los resultados del usuario para un examen
    getResults: async (examId: string) => {
        const response = await api.get(`/exams/${examId}/results`);
        return response.data
    },

    // Devuelve el examen asociado a un curso
    getByCourse: async (courseId: number) => {
    const response = await api.get(`/exams/courses/${courseId}`);
    return response.data; 
    },

    // Elimina examen por medio de Id
    remove: async (examId: string) => {
        await api.delete(`/exams/${examId}`);
    }
}