import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { forumService, type ForumThread } from '../services/forumService'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CircleUser } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const schema = z.object({
    body: z.string().min(5, 'La respuesta debe tener al menos 5 caracteres'),
});

type ReplyForm = z.infer<typeof schema>;

function ThreadDetailPage() {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const [thread, setThread] = useState<ForumThread | null>(null);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } = useForm<ReplyForm>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (!threadId) return;
        forumService.getThread(threadId)
            .then(setThread)
            .finally(() => setLoading(false));
    }, [threadId]);

    const onSubmit = async (data: ReplyForm) => {
        if (!threadId) return;
        try {
            const reply = await forumService.createReply(threadId, data.body);
            setThread(prev => prev ? {
                ...prev,
                replies: [...(prev.replies ?? []), reply]
            } : prev);
            reset();
        } catch (error: any) {
            setError('root', { message: error.response?.data?.message || 'Error al responder' })
        }
    };

    if (loading) return <p className="text-center text-secundario py-12 text-2xl">Cargando...</p>;

    if (!thread) return <p className="text-center text-secundario py-12 text-2xl">Hilo no encontrado</p>;

    return (
        <>
            <div className="min-h-screen bg-fondo">
                <nav className="bg-fondo-claro shadow px-8 py-4 flex justify-between items-center">
                    <Button size="sm" onClick={() => navigate(-1)} >
                        <ArrowLeft size={16} /> Volver al foro
                    </Button>
                    <h1 className="text-xl font-bold text-primario">Hilo del foro</h1>
                </nav>
                <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
                    <Card>
                        <CardHeader className="flex justify-start items-start">
                            <CircleUser />
                            <CardTitle className="text-xl font-fold">
                                {thread.author?.firstName} {thread.author?.lastName} — {new Date(thread.createdAt).toLocaleDateString()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-start items-start">
                                <div>
                                    <p className="text-lg font-semibold text-secundario">{thread.title}</p>
                                    <p className="text-md text-secundario">{thread.body}</p>
                                </div>
                                {thread.isPinned && <Badge variant="default">Fijado</Badge>}
                            </div>
                        </CardContent>
                    </Card>

                    <div>
                        <h3 className="text-lg font-bold mb-4">
                            Respuestas ({thread.replies?.length ?? 0})
                        </h3>
                        {thread.replies?.length === 0 ? (
                            <p className="text-secundario">No hay respuestas todavia.</p>
                        ) : (
                            <div className="space-y-4">
                                {thread.replies?.map(reply => (
                                    <Card key={reply.id}>
                                        <CardHeader className="flex justify-start items-start">
                                            <CircleUser />
                                            <CardTitle className="text-m font-fold">
                                                {reply.author?.firstName} {reply.author?.lastName} — {new Date(reply.createdAt).toLocaleDateString()}

                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-start items-start">
                                                <div>
                                                    <p className="text-md text-secundario">{reply.body}</p>
                                                </div>
                                                {thread.isPinned && <Badge variant="default">Fijado</Badge>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {!thread.isClosed ? (
                        <Card>
                            <CardHeader><CardTitle>Responder</CardTitle></CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-1">
                                        <Label>Tu respuesta</Label>
                                        <Textarea rows={4} placeholder="Escribe tu respuesta..." {...register('body')} />
                                        {errors.body && <p className="text-destructive text-sm">{errors.body.message}</p>}
                                    </div>
                                    {errors.root && <p className="text-destructive text-sm text-center">{errors.root.message}</p>}
                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting ? 'Publicando...' : 'Publicar respuesta'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <p className="text-center text-secundario">Este hilo esta cerrado.</p>
                    )}
                </div>
            </div>
        </>
    )
}

export default ThreadDetailPage;