import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/app/providers/AuthContext';
import { type Lesson, lessonService } from '../services/lessonService';
import { useCourse } from '../hooks/useCourses.hook';
import { useLessons } from '../hooks/useLessons.hook';
import LessonForm from '../components/LessonForm';
import { type LessonFormData } from '../components/LessonForm';
import LessonList from '../components/LessonList';

function LessonPage() {
    const { logout } = useAuth();
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { course } = useCourse(Number(courseId));
    const { lessons, setLessons, loading } = useLessons(Number(courseId));
    const [showForm, setShowForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    const openCreateForm = () => {
        setEditingLesson(null);
        setShowForm(true);
    }

    const openEditForm = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setShowForm(true);
    }

    const handleSubmit = async (data: LessonFormData) => {
        try {
            if (editingLesson) {
                const updateLesson = await lessonService.update(Number(courseId), editingLesson.id, data);
                setLessons(lessons.map(l => l.id === updateLesson.id ? updateLesson : l));
            } else {
                const newLesson = await lessonService.create(Number(courseId), data);
                setLessons([...lessons, newLesson]);
            }

            setShowForm(false);
            setEditingLesson(null);
        } catch (error) {
            confirm('Ocurrió un error al guardar la lección. Por favor, intenta de nuevo.');
        }
    }

    const handleDelete = async (lessonId: string) => {
        const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta lección? Esta acción no se puede deshacer.');
        if (!confirmDelete) return;
        await lessonService.remove(Number(courseId), lessonId);
        setLessons(prev => prev.filter(l => l.id !== lessonId));
    }

    return (
        <>
            <div className="min-h-screen bg-muted/40">
                <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
                    <Button size="sm" onClick={() => navigate('/creator-dashboard')} className="hover:cursor-pointer">
                        ← Volver
                    </Button>
                    <h1 className="text-xl font-bold text-primary">Lecciones</h1>
                    <Button variant="destructive" size="sm" onClick={logout} className="hover:cursor-pointer">
                        Cerrar sesión
                    </Button>
                </nav>
                <div className="max-w-3xl mx-auto px-8 py-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{course?.title}</h2>
                            <p className="text-muted-foreground text-sm">Gestiona las lecciones de este curso</p>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={openCreateForm} className="hover:cursor-pointer">
                                + Nueva lección
                            </Button>
                            <Button onClick={() => {
                                navigate(`/creator/courses/${courseId}/exam/new`)
                            }} className="hover:cursor-pointer">
                                + Nuevo examen
                            </Button>
                        </div>
                    </div>

                    {showForm && (
                        <LessonForm
                            editingLesson={editingLesson ?? undefined}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setShowForm(false);
                            }}

                        />
                    )}

                    {loading ? (
                        <p className="text-muted-foreground">
                            Cargando...
                        </p>

                    ) : lessons.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground mb-4">No hay lecciones todavía.</p>
                                <Button onClick={openCreateForm} className="hover:cursor-pointer">
                                    Crear primera lección
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <LessonList
                            lessons={lessons}
                            onEdit={openEditForm}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export default LessonPage;