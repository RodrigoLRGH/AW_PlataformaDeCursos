import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { lessonService, type Lesson } from '../services/lessonService';
import { progressService, type LessonProgress } from '../services/progressService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/providers/AuthContext';

function LessonDetailPage() {
    const { logout } = useAuth();
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        if (!courseId || !lessonId) return;
        lessonService.getOne(Number(courseId), lessonId)
            .then(setLesson)
            .finally(() => setLoading(false));

        progressService.getCourseProgress(Number(courseId))
            .then((progress: LessonProgress[]) => {
                const found = progress.find((p: LessonProgress) => p.lessonId === lessonId);
                setCompleted(found?.completed ?? false);
            });

    }, [courseId, lessonId]);

    const handleComplete = async () => {
        if (!lessonId) return;
        setCompleting(true);
        try {
            const result = await progressService.markComplete(lessonId);
            setCompleted(true);
            if (result.courseCompleted) {
                alert('¡Felicidades! Completaste el curso');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al marcar lección');
        } finally {
            setCompleting(false);
        }
    }

    if (loading) return <p className="text-center">Cargando...</p>;

    if (!lesson) return <p className="text-center">Lección no encontrada</p>;

    return (
        <div className="min-h-screen bg-muted/40">
            <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
                <Button size="sm" onClick={() => navigate(-1)} className="hover:cursor-pointer">
                    ← Volver al curso
                </Button>
                <h1 className="text-xl font-bold text-primary">Lección</h1>
                <Button variant="destructive" size="sm" onClick={logout} className="hover:cursor-pointer">
                    Cerrar sesión
                </Button>
            </nav>
            <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
                        <div className="flex gap-2">
                            {lesson.order && <Badge variant="outline">Lección #{lesson.order}</Badge>}
                            {lesson.durationMinutes && <Badge variant="secondary">{lesson.durationMinutes} min</Badge>}
                        </div>
                    </div>
                    {completed ? (
                        <Badge variant="default" className="text-sm px-3 py-1">Completada</Badge>
                    ) : (
                        <Button onClick={handleComplete} disabled={completing} className="hover:cursor-pointer">
                            {completing ? 'Guardando...' : 'Marcar como completada'}
                        </Button>
                    )}
                </div>

                {lesson.contentUrl && (
                    <Card>
                        <CardHeader><CardTitle>Contenido</CardTitle></CardHeader>
                        <CardContent>
                            <a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer"
                                className="text-primary hover:underline break-all">
                                {lesson.contentUrl}
                            </a>
                        </CardContent>
                    </Card>
                )}

                {lesson.description && (
                    <Card>
                        <CardHeader><CardTitle>Descripción</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">{lesson.description}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default LessonDetailPage;