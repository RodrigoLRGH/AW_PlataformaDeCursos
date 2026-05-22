import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useCourse } from '../hooks/useCourses.hook';
import { enrollmentService } from '../services/enrollmentService';
import { lessonService, type Lesson } from '../services/lessonService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { examService } from '@/features/exams/services/examService';
import { progressService } from '../services/progressService';
import { useProgress } from '../hooks/useProgress.hook';
import { certificateService } from '../services/certificateService';
import { useAuth } from '@/app/providers/AuthContext';

const levelLabels: Record<string, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
};

function CourseDetailPage() {
    const { logout } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const { course, loading } = useCourse(Number(id));
    const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
    const [enrolling, setEnrolling] = useState(false);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [exam, setExam] = useState(null);
    const { progress, setProgress } = useProgress(Number(id));
    const [generatingCertificate, setGeneratingCertificate] = useState(false);

    useEffect(() => {
        examService.getByCourse(Number(id))
            .then(setExam)
            .catch(() => setExam(null));
    }, [id]);

    useEffect(() => {
        if (!id) return;

        enrollmentService.checkEnrollment(Number(id))
            .then(setIsEnrolled)
            .catch(() => setIsEnrolled(false));

        lessonService.getByCourse(Number(id))
            .then(setLessons)
            .catch(() => setLessons([]));
    }, [id]);

    const handleGenerateCertificate = async () => {
        setGeneratingCertificate(true);
        try {
            const cert = await certificateService.generate(Number(id));
            alert(`Certificado generado exitosamente: Codigo: ${cert.certificateCode}`);
        } catch (error) {
            alert('Error al generar certificado');
        } finally {
            setGeneratingCertificate(false);
        }
    };

    const handleComplete = async (lessonId: string) => {
        try {
            const result = await progressService.markComplete(lessonId)
            setProgress(prev => prev.map(p =>
                p.lessonId === lessonId ? { ...p, completed: true } : p
            ))
            if (result.courseCompleted) {
                alert('¡Felicidades! Completaste el curso')
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al marcar lección')
        }
    }

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            await enrollmentService.enroll(Number(id));
            setIsEnrolled(true);
        } catch (error) {
            alert('Error al inscribirse en el curso');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading)
        return <p className='text-center py-12 text-muted-foreground'>Cargando...</p>
    if (!course)
        return <p className='text-center py-12 text-muted-foreground'>Curso no encontrado.</p>

    return (
        <>
            <div className="min-h-screen bg-muted/40">
                <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
                    <Button size="sm" className="px-4 hover:cursor-pointer" onClick={() => navigate(-1)}>
                        ← Volver
                    </Button>
                    <h1 className="text-xl font-bold text-primary">Plataforma de cursos</h1>
                    <Button variant="destructive" size="sm" onClick={logout} className="hover:cursor-pointer">
                        Cerrar sesión
                    </Button>
                </nav>
                <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
                    {course.thumbnailUrl && (
                        <img src={course.thumbnailUrl} alt={course.title}
                            className="w-full h-64 object-cover rounded-xl" />
                    )}
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{course.title}</h2>
                            <div className="flex gap-2 flex-wrap">
                                {course.category && <Badge variant="secondary">{course.category}</Badge>}
                                {course.level && <Badge variant="outline">{levelLabels[course.level] ?? course.level}</Badge>}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-primary mb-2">
                                {Number(course.price) === 0 ? 'Gratis' : `$${Number(course.price).toFixed(2)} MXN`}
                            </p>
                            {isEnrolled ? (
                                <Button variant="outline" disabled className="hover:cursor-pointer">Inscrito</Button>
                            ) : (
                                <Button onClick={handleEnroll} disabled={enrolling} className="hover:cursor-pointer">
                                    {enrolling ? 'Inscribiendo...' : 'Inscribirse'}
                                </Button>
                            )}
                            {isEnrolled && exam && (
                                <Button variant='secondary' onClick={() => navigate(`/courses/${id}/exam`)} className="hover:cursor-pointer">
                                    Tomar Examen
                                </Button>
                            )}
                            {isEnrolled && (
                                <Button variant="outline" onClick={handleGenerateCertificate} disabled={generatingCertificate} className="hover:cursor-pointer">
                                    {generatingCertificate ? 'Generando...' : 'Obtener certificado'}
                                </Button>
                            )}
                            {isEnrolled && (
                                <Button variant="outline" onClick={() => navigate(`/forums/${id}`)} className="hover:cursor-pointer">
                                    Foro del curso
                                </Button>
                            )}
                        </div>
                    </div>
                    {course.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Descripción</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{course.description}</p>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader><CardTitle>Lecciones ({lessons.length})</CardTitle></CardHeader>
                        <CardContent>
                            {lessons.length === 0 ? (
                                <p className="text-muted-foreground">Este curso no tiene lecciones todavía.</p>
                            ) : (
                                <div className="space-y-2">
                                    {[...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(lesson => (
                                        <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg border"
                                            onClick={() => navigate(`/courses/${id}/lessons/${lesson.id}`)} style={{ cursor: 'pointer' }}>
                                            <Badge variant="outline">#{lesson.order ?? 0}</Badge>
                                            <div className="flex-1">
                                                <p className="font-medium">{lesson.title}</p>
                                                {lesson.durationMinutes && (
                                                    <p className="text-xs text-muted-foreground">{lesson.durationMinutes} min</p>
                                                )}
                                            </div>
                                            {isEnrolled && (
                                                progress.find(p => p.lessonId === lesson.id)?.completed ? (
                                                    <div>
                                                        <Badge variant="default">Completada</Badge>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="outline" onClick={() => handleComplete(lesson.id)} className="hover:cursor-pointer">
                                                        Completar
                                                    </Button>
                                                )

                                            )}

                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div >
        </>
    )
}

export default CourseDetailPage;