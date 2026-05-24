import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
    title: z.string().min(2, 'Minimo 2 caracteres'),
    description: z.string().optional(),
    contentUrl: z.string().url('URL del contenido inválida').optional().or(z.literal('')),
    order: z.number().optional(),
    durationMinutes: z.number().optional(),
});

export type LessonFormData = z.infer<typeof schema>;

interface Props {
    editingLesson?: LessonFormData;
    onSubmit: (data: LessonFormData) => void;
    onCancel: () => void;
    error?: string;
}

function LessonForm({ editingLesson, onSubmit, onCancel, error }: Props) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } = useForm<LessonFormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        reset(editingLesson ?? {
            title: '',
            description: '',
            contentUrl: '',
            order: 0,
            durationMinutes: 0,
        }
        );
    }, [editingLesson, reset]);

    return (
        <>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>
                        {editingLesson ? 'Editar lección' : 'Nueva lección'}
                    </CardTitle>
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
                        {error && <p className="text-destructive text-sm text-center">{error}</p>}
                        {errors.root && <p className="text-destructive text-sm text-center">{errors.root.message}</p>}
                        <div className="flex gap-3">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? 'Guardando...' : editingLesson ? 'Guardar cambios' : 'Crear lección'}
                            </Button>
                            <Button type="button" variant="outline" className="flex-1" onClick={() => onCancel()}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

export default LessonForm;