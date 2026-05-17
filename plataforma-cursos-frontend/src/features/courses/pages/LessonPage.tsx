import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { type Lesson, lessonService } from '../services/lessonService';
import { useCourse } from '../hooks/useCourses.hook';
import { useLessons } from '../hooks/useLessons.hook';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const schema = z.object({
    title: z.string().min(2, 'Minimo 2 caracteres'),
    description: z.string().optional(),
    contentUrl: z.string().url('URL del contenido inválida').optional().or(z.literal('')),
    order: z.number().optional(),
    durationMinutes: z.number().optional(),
})

type LessonFormData = z.infer<typeof schema>

function LessonPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { course } = useCourse(Number(courseId));
    const { lessons, setLessons, loading } = useLessons(Number(courseId));
    const [showForm, setShowForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } = useForm<LessonFormData>({
        resolver: zodResolver(schema),
    });

    const openCreateForm = () => {
        setEditingLesson(null);
        setShowForm(true);
        reset({ title: '', contentUrl: '', order: 0, durationMinutes: 0 });
    }

    const openEditForm = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setShowForm(true);
        reset({
            title: lesson.title,
            description: lesson.description,
            contentUrl: lesson.contentUrl,
            order: lesson.order,
            durationMinutes: lesson.durationMinutes
        });
    }

    const onSubmit = async (data: LessonFormData) => {
        try {
            if (editingLesson) {
                const updatedLesson = await lessonService.update(Number(courseId), editingLesson.id, data);
                setLessons(prev => prev.map(l => l.id === updatedLesson.id ? updatedLesson : l));
                console.log('Lección actualizada:', updatedLesson);
            } else {
                const newLesson = await lessonService.create(Number(courseId), data);
                setLessons(prev => [...prev, newLesson]);
            }
            setShowForm(false);
            reset();
        } catch (error: any) {
            setError('root', { message: error.message || 'Error al guardar la lección' });
        }
    }

    const handleDelete = async (lessonId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta lección?'))
            return;

        await lessonService.remove(Number(courseId), lessonId);
        setLessons(prev => prev.filter(l => l.id !== lessonId));
    }

    return (
        <>
            <div className="min-h-screen bg-muted/40">
                <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">Lecciones</h1>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/creator-dashboard')}>
                        ← Volver
                    </Button>
                </nav>
                <div className="max-w-3xl mx-auto px-8 py-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{course?.title}</h2>
                            <p className="text-muted-foreground text-sm">Gestiona las lecciones de este curso</p>
                        </div>
                        <Button onClick={openCreateForm}>+ Nueva lección</Button>
                        <Button variant="outline" onClick={() => {
                            navigate(`/creator/courses/${courseId}/exam/new`)

                        }}>+ Nuevo examen</Button>
                    </div>

                    {showForm && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>{editingLesson ? 'Editar lección' : 'Nueva lección'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-1">
                                        <Label>Título</Label>
                                        <Input placeholder="Título de la lección" {...register('title')} />
                                        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Descripción</Label>
                                        <Textarea rows={4} placeholder="Descripción de la lección..." {...register('description')} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>URL del contenido</Label>
                                        <Input placeholder="https://..." {...register('contentUrl')} />
                                        {errors.contentUrl && <p className="text-destructive text-sm">{errors.contentUrl.message}</p>}
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="space-y-1 flex-1">
                                            <Label>Orden</Label>
                                            <Input type="number" min="0" {...register('order', { valueAsNumber: true })} />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <Label>Duración (minutos)</Label>
                                            <Input type="number" min="0" {...register('durationMinutes', { valueAsNumber: true })} />
                                        </div>
                                    </div>
                                    {errors.root && <p className="text-destructive text-sm text-center">{errors.root.message}</p>}
                                    <div className="flex gap-3">
                                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                                            {isSubmitting ? 'Guardando...' : editingLesson ? 'Guardar cambios' : 'Crear lección'}
                                        </Button>
                                        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                                            Cancelar
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {loading ? (
                        <p className="text-muted-foreground">Cargando...</p>
                    ) : lessons.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground mb-4">No hay lecciones todavía.</p>
                                <Button onClick={openCreateForm}>Crear primera lección</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {[...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(lesson => (
                                <Card key={lesson.id}>
                                    <CardHeader className="flex flex-row items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline">#{lesson.order ?? 0}</Badge>
                                            <div>
                                                <p className="font-medium">{lesson.title}</p>
                                                {lesson.durationMinutes ? (
                                                    <p className="text-xs text-muted-foreground">{lesson.durationMinutes} min</p>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditForm(lesson)}>Editar</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(lesson.id)}>Eliminar</Button>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default LessonPage;