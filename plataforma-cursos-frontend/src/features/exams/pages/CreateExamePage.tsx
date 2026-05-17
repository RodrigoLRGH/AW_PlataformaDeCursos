import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { examService } from '../services/examService';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Question {
    question: string;
    options: [string, string, string, string];
    correctAnswer: number;
    points: number;
}

function CreateExamPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [passingScore, setPassingScore] = useState(60);
    const [questions, setQuestions] = useState<Question[]>([
        { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }
    ]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const addQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]);
    }

    const removeQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    }

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
    }

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex)
                return q;
            const options = [...q.options] as [string, string, string, string];
            options[oIndex] = value;
            return { ...q, options };
        }));
    }

    const handleSubmit = async () => {
        if (!title.trim())
            return setError('El titulo es requerido');

        if (questions.some(q => !q.question.trim()))
            return setError('Todas las preguntas deben tener texto');

        if (questions.some(q => q.options.some(o => !o.trim())))
            return setError('Todas las opciones deben tener texto');

        setSubmitting(true);
        setError('');

        try {
            await examService.create(Number(courseId), {
                title,
                passingScore,
                questions: questions.map((q, i) => ({ ...q, order: i })),
            });

            navigate(`/creator/courses/${courseId}/lessons`);
        } catch (error) {
            setError('Error al crear el examen');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className="min-h-screen bg-muted/40">
                <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">Crear examen</h1>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/creator/courses/${courseId}/lessons`)}>
                        ← Volver
                    </Button>
                </nav>
                <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Información del examen</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label>Título</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del examen" />
                            </div>
                            <div className="space-y-1">
                                <Label>Puntaje mínimo para aprobar (%)</Label>
                                <Input type="number" min="0" max="100" value={passingScore}
                                    onChange={e => setPassingScore(Number(e.target.value))} />
                            </div>
                        </CardContent>
                    </Card>

                    {questions.map((q, qIndex) => (
                        <Card key={qIndex}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base">Pregunta {qIndex + 1}</CardTitle>
                                {questions.length > 1 && (
                                    <Button variant="destructive" size="sm" onClick={() => removeQuestion(qIndex)}>
                                        Eliminar
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <Label>Pregunta</Label>
                                    <Input value={q.question}
                                        onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                                        placeholder="Escribe la pregunta..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Opciones</Label>
                                    {q.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <input type="radio" name={`correct-${qIndex}`}
                                                checked={q.correctAnswer === oIndex}
                                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                className="cursor-pointer" />
                                            <Input value={option}
                                                onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                                placeholder={`Opción ${oIndex + 1}`} />
                                        </div>
                                    ))}
                                    <p className="text-xs text-muted-foreground">Selecciona el radio de la respuesta correcta</p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Puntos</Label>
                                    <Input type="number" min="1" value={q.points}
                                        onChange={e => updateQuestion(qIndex, 'points', Number(e.target.value))}
                                        className="w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {error && <p className="text-destructive text-sm text-center">{error}</p>}

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={addQuestion} className="flex-1">
                            + Agregar pregunta
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                            {submitting ? 'Guardando...' : 'Crear examen'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )

}

export default CreateExamPage;   