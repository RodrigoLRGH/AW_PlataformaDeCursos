import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { examService, type ExamResult } from '../services/examService'
import { useExamQuestions, useExamResults } from '../hooks/useExam.hook'
import { examService as es } from '../services/examService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function ExamPage() {
    const { courseId, examId } = useParams()
    const navigate = useNavigate()
    const { questions, loading: loadingQ } = useExamQuestions(examId ?? '')
    const { results, loading: loadingR } = useExamResults(examId ?? '')
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [result, setResult] = useState<ExamResult | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const loading = loadingQ || loadingR

    // El examen ya fue contestado si hay resultados previos
    const previousResult = results?.[0] ?? null
    const alreadySubmitted = !!previousResult && !result

    const handleAnswer = (questionId: string, selectedOption: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOption }))
    }

    const handleSubmit = async () => {
        if (!examId) return
        if (Object.keys(answers).length < questions.length) {
            return setError('Debes responder todas las preguntas para poder enviar el examen')
        }
        setSubmitting(true)
        setError('')
        try {
            const res = await examService.submit(examId, {
                answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
                    questionId,
                    selectedOption,
                })),
            })
            setResult(res)
        } catch {
            setError('Error al enviar el examen')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <p className="text-center py-12 text-secundario">Cargando examen...</p>

    const shownResult = result ?? (alreadySubmitted ? previousResult : null)

    return (
        <div className="min-h-screen bg-fondo">
            <nav className="bg-fondo-claro shadow px-8 py-4 flex justify-center items-center">
                <h1 className="text-xl font-bold text-primario">Examen</h1>
            </nav>
            <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
                {shownResult ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {alreadySubmitted ? 'Ya realizaste este examen' : 'Resultado del examen'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-5xl font-bold">{Number(shownResult.score).toFixed(0)}%</p>
                            <Badge variant={shownResult.isPassed ? 'default' : 'destructive'} className="text-base px-4 py-1">
                                {shownResult.isPassed ? 'Aprobado' : 'Reprobado'}
                            </Badge>
                            <p className="text-secundario">
                                {shownResult.correctAnswers} de {shownResult.totalQuestions} respuestas correctas
                            </p>
                            {alreadySubmitted && (
                                <p className="text-sm text-secundario">
                                    Realizado el {new Date(shownResult.submittedAt).toLocaleDateString()}
                                </p>
                            )}
                            <Button onClick={() => navigate(`/courses/${courseId}`)}>
                                Volver al curso
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="flex justify-between items-center">
                            <p className="text-secundario">{questions.length} preguntas</p>
                        </div>
                        {questions.sort((a, b) => a.order - b.order).map((q, index) => (
                            <Card key={q.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">
                                        {index + 1}. {q.question}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {q.options.map((option, oIndex) => (
                                        <div key={oIndex}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
                                                ${answers[q.id] === oIndex ? 'border-primario bg-primario/5' : 'hover:bg-muted'}`}
                                            onClick={() => handleAnswer(q.id, oIndex)}>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                                                ${answers[q.id] === oIndex ? 'border-primario' : 'border-secundario'}`}>
                                                {answers[q.id] === oIndex && (
                                                    <div className="w-2 h-2 rounded-full bg-primario" />
                                                )}
                                            </div>
                                            <span className="text-sm">{option}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                        {error && <p className="text-destructive text-sm text-center">{error}</p>}
                        <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Enviando...' : 'Enviar examen'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}

export default ExamPage