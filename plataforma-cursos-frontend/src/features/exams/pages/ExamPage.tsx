import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { examService, type ExamResult } from '../services/examService'
import { useExamByCourse, useExamQuestions } from '../hooks/useExam.hook'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'

function ExamPage() {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const { exam, loading } = useExamByCourse(Number(courseId))
    const { questions } = useExamQuestions(exam?.id ?? '')
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [result, setResult] = useState<ExamResult | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleAnswer = (questionId: string, selectedOption: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOption }))
    }

    const handleSubmit = async () => {
        if (!exam) return

        if (Object.keys(answers).length < questions.length) {
            return setError('Debes responder todas las preguntas para poder enviar el examen')
        }

        setSubmitting(true)
        setError('')
        try {
            const result = await examService.submit(exam.id, {
                answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
                    questionId,
                    selectedOption,
                })),
            })
            setResult(result)
        } catch {
            setError('Error al enviar el examen')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <p className="text-center py-12 text-muted-foreground">Cargando examen...</p>

    if (!exam) return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center">
            <Card className="max-w-md w-full">
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">Este curso no tiene examen todavía.</p>
                    <Button onClick={() => navigate(`/courses/${courseId}`)}>
                        <ArrowLeft size={16} /> Volver al curso
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
    return (
        <>
            <div className="min-h-screen bg-muted/40">
                <nav className="bg-background shadow px-8 py-4 flex justify-center items-center">
                    <h1 className="text-xl font-bold text-primary">{exam.title}</h1>
                </nav>
                <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
                    {result ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Resultado del examen</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <p className="text-5xl font-bold">{Number(result.score).toFixed(0)}%</p>
                                <Badge variant={result.isPassed ? 'default' : 'destructive'} className="text-base px-4 py-1">
                                    {result.isPassed ? 'Aprobado' : 'Reprobado'}
                                </Badge>
                                <p className="text-muted-foreground">
                                    {result.correctAnswers} de {result.totalQuestions} respuestas correctas
                                </p>
                                <Button onClick={() => navigate(`/courses/${courseId}`)} className="hover:cursor-pointer">
                                    Volver al curso
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <p className="text-muted-foreground">{questions.length} preguntas</p>
                                <p className="text-muted-foreground text-sm">Puntaje mínimo: {exam.passingScore}%</p>
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
                        ${answers[q.id] === oIndex ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                                onClick={() => handleAnswer(q.id, oIndex)}>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${answers[q.id] === oIndex ? 'border-primary' : 'border-muted-foreground'}`}>
                                                    {answers[q.id] === oIndex && (
                                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                                <span className="text-sm">{option}</span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                            {error && <p className="text-destructive text-sm text-center">{error}</p>}
                            <Button className="w-full hover:cursor-pointer" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Enviando...' : 'Enviar examen'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default ExamPage;
