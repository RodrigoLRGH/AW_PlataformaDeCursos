import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/app/providers/AuthContext';
import { type Lesson, lessonService } from '../services/lessonService';
import { useCourse } from '../hooks/useCourses.hook';
import { useLessons } from '../hooks/useLessons.hook';
import LessonForm from '../components/LessonForm';
import { type LessonFormData } from '../components/LessonForm';
import LessonList from '../components/LessonList';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { ArrowLeft, Plus } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import { useExamsByCourse } from '@/features/exams/hooks/useExam.hook'
import { type Exam } from '@/features/exams/services/examService'
import { examService } from '@/features/exams/services/examService'
import { CardHeader, CardTitle } from '@/components/ui/card'

function LessonPage() {
    const { logout } = useAuth();
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { course } = useCourse(Number(courseId));
    const { lessons, setLessons, loading } = useLessons(Number(courseId));
    const [showForm, setShowForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [lessonToDelete, setLessonToDelete] = useState<string | null>(null)
    const [formError, setFormError] = useState('')
    const { isDark, toggleTheme } = useTheme()
    const { exams, setExams } = useExamsByCourse(Number(courseId))
    const [confirmExamOpen, setConfirmExamOpen] = useState(false)
    const [examToDelete, setExamToDelete] = useState<string | null>(null)
    
    const handleDeleteExam = (examId: string) => {
        setExamToDelete(examId)
        setConfirmExamOpen(true)
    }

    const confirmDeleteExam = async () => {
        if (!examToDelete) return
        await examService.remove(examToDelete)
        setExams(prev => prev.filter(e => e.id !== examToDelete))
        setConfirmExamOpen(false)
        setExamToDelete(null)
    }

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
        } catch (error: any) {
            setFormError(error.response?.data?.message || 'Error al guardar la leccion');
        }
    }

    const handleDelete = async (lessonId: string) => {
        setLessonToDelete(lessonId)
        setConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (!lessonToDelete) return
        await lessonService.remove(Number(courseId), lessonToDelete)
        setLessons(prev => prev.filter(l => l.id !== lessonToDelete))
        setConfirmOpen(false)
        setLessonToDelete(null)
    }
    return (
        <>
            <div className="min-h-screen bg-fondo">
                <nav className="bg-fondo-claro shadow px-8 py-4 flex justify-between items-center">
                    <div className="flex flex-1">
                        <Button size="sm" onClick={() => navigate('/creator-dashboard')}>
                            <ArrowLeft size={16} /> Volver 
                        </Button>
                    </div>

                    <h1 className="text-xl font-bold text-primario">Lecciones</h1>

                    <div className="flex flex-1 justify-end items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleTheme}>
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={logout}>
                            Cerrar sesión
                        </Button>
                    </div>
                </nav>
                <div className="max-w-3xl mx-auto px-8 py-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{course?.title}</h2>
                            <p className="text-secundario text-sm">Gestiona las lecciones de este curso</p>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => navigate(`/forums/${courseId}`)}>
                                Foro del curso
                            </Button>
                            <Button onClick={openCreateForm} >
                                <Plus /> Nueva leccion
                            </Button>
                        </div>
                    </div>

                    {showForm && (
                        <LessonForm
                            editingLesson={editingLesson ?? undefined}
                            onSubmit={handleSubmit}
                            onCancel={() => { setShowForm(false); setFormError('') }}
                            error={formError} />
                    )}

                    {loading ? (
                        <p className="text-secundario">
                            Cargando...
                        </p>

                    ) : lessons.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-secundario mb-4">No hay lecciones todavia.</p>
                                <Button onClick={openCreateForm} >
                                    Crear primera leccion
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
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Exámenes ({exams.length})</h3>
                            <Button onClick={() => navigate(`/creator/courses/${courseId}/exam/new`)}>
                                <Plus /> Nuevo examen
                            </Button>
                        </div>
                        {exams.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-secundario">No hay examenes creados en este curso.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {exams.map((exam: Exam) => (
                                    <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <p className="font-medium">{exam.title}</p>
                                        <Badge variant="outline">{exam.passingScore}% minimo</Badge>
                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteExam(exam.id)}>
                                            Eliminar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmDialog
                open={confirmOpen}
                title="Eliminar leccion"
                description="¿Estas seguro de eliminar esta leccion?"
                confirmLabel="Eliminar"
                variant="destructive"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmOpen(false)
                    setLessonToDelete(null)
                }}
            />
            <ConfirmDialog  
                open={confirmExamOpen}
                title="Eliminar examen"
                description="¿Estas seguro de eliminar este examen?"
                confirmLabel="Eliminar"
                variant="destructive"
                onConfirm={confirmDeleteExam}
                onCancel={() => {
                    setConfirmExamOpen(false)
                    setExamToDelete(null)
                }}
            />
        </>
    )
}

export default LessonPage;