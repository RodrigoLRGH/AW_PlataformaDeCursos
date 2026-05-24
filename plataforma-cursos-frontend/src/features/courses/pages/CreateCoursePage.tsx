import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { courseService } from '../services/courseService';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/app/providers/AuthContext';
import { ArrowLeft, X } from 'lucide-react';


const schema = z.object({
    title: z.string().min(3, 'Minimo 3 caracteres'),
    description: z.string().optional(),
    thumbnailUrl: z.string().url('URL invalida').optional().or(z.literal('')),
    price: z.number().min(0, 'El precio no puede ser negativo'),
    category: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

type CreateCourseFormData = z.infer<typeof schema>;

export function CreateCoursePage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, setError } = useForm<CreateCourseFormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: CreateCourseFormData) => {
        try {
            await courseService.create(data);
            navigate('/creator-dashboard');
        } catch (error) {
            setError('root', { message: 'Error al crear curso' });
        }
    };

    return (
        <>
            <div className="min-h-screen bg-muted/40">
                <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
                    <Button size="sm" onClick={() => navigate('/creator-dashboard')} className="hover:cursor-pointer">
                        <ArrowLeft size={16} /> Volver
                    </Button>
                    <h1 className="text-xl font-bold text-primary">Nuevo curso</h1>
                    <Button variant="destructive" size="sm" onClick={logout} className="hover:cursor-pointer">
                        Cerrar sesión
                    </Button>
                </nav>
                <div className="max-w-2xl mx-auto px-8 py-10">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del curso</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="title">Título</Label>
                                    <Input id="title" placeholder="Nombre del curso" {...register('title')} />
                                    {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea id="description" rows={4} placeholder="Describe tu curso..." {...register('description')} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="thumbnailUrl">URL de portada</Label>
                                    <Input id="thumbnailUrl" placeholder="https://..." {...register('thumbnailUrl')} />
                                    {errors.thumbnailUrl && <p className="text-destructive text-sm">{errors.thumbnailUrl.message}</p>}
                                </div>
                                <div className="flex gap-4">
                                    <div className="space-y-1 flex-1">
                                        <Label htmlFor="category">Categoría</Label>
                                        <Input id="category" placeholder="ej. Programación" {...register('category')} />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <Label>Nivel</Label>
                                        <Select onValueChange={(val) => setValue('level', val as 'beginner' | 'intermediate' | 'advanced')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar nivel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Principiante</SelectItem>
                                                <SelectItem value="intermediate">Intermedio</SelectItem>
                                                <SelectItem value="advanced">Avanzado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="price">Precio (MXN)</Label>
                                    <Input id="price" type="number" min="0" placeholder="0.00" {...register('price', { valueAsNumber: true })} />
                                    {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="outline" className="flex-1 hover:cursor-pointer"
                                        onClick={() => navigate('/creator-dashboard')}>
                                        <X size={16} /> Cancelar
                                    </Button>
                                    <Button type="submit" className="flex-1 hover:cursor-pointer" disabled={isSubmitting} >
                                        {isSubmitting ? 'Guardando...' : 'Crear curso'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default CreateCoursePage;