import { useState, useEffect } from 'react'
import { examService, type Exam, type ExamQuestion, type ExamResult } from '../services/examService'



export function useExamsByCourse(courseId: number) {
    const [exams, setExams] = useState<Exam[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!courseId) return
        examService.getByCourse(courseId)
            .then(setExams)
            .catch(() => setError('No se pudieron cargar los examenes'))
            .finally(() => setLoading(false))
    }, [courseId])

    return { exams, setExams, loading, error }
}



export function useExamQuestions(examId: string) {
    const [questions, setQuestions] = useState<ExamQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!examId) return
        examService.getQuestions(examId)
            .then(setQuestions)
            .catch(() => setError('No se pudieron cargar las preguntas'))
            .finally(() => setLoading(false))
    }, [examId])

    return { questions, loading, error }
}


export function useExamResults(examId: string) {
    const [results, setResults] = useState<ExamResult[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!examId) return
        examService.getResults(examId)
            .then(setResults)
            .catch(() => setError('No se pudieron cargar los resultados'))
            .finally(() => setLoading(false))
    }, [examId])

    return { results, loading, error }
}