import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useCourse } from '../hooks/useCourses.hook';
import { enrollmentService } from '../services/enrollmentService';
import { lessonService, type Lesson } from '../services/lessonService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { examService } from '@/features/exams/services/examService';


const levelLabels: Record<string, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
};

function CourseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { course, loading } = useCourse(Number(id));
    const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
    const [enrolling, setEnrolling] = useState(false);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [exam, setExam] = useState(null);

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
                    <h1 className="text-xl font-bold text-primary">Plataforma de cursos</h1>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/catalog')}>
                        ← Volver al catálogo
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
                                <Button variant="outline" disabled>Inscrito</Button>
                            ) : (
                                <Button onClick={handleEnroll} disabled={enrolling}>
                                    {enrolling ? 'Inscribiendo...' : 'Inscribirse'}
                                </Button>
                            )}
                            {isEnrolled && exam && (
                                <Button variant='secondary' onClick={() => navigate(`/courses/${id}/exam`)}>
                                    Tomar Examen
                                </Button>
                            )}
                        </div>
                    </div>
                    {course.description && (
                        <Card>
                            <CardHeader><CardTitle>Descripción</CardTitle></CardHeader>
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
                                        <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                            <Badge variant="outline">#{lesson.order ?? 0}</Badge>
                                            <div className="flex-1">
                                                <p className="font-medium">{lesson.title}</p>
                                                {lesson.durationMinutes && (
                                                    <p className="text-xs text-muted-foreground">{lesson.durationMinutes} min</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default CourseDetailPage;