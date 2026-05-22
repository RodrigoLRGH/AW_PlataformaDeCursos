import { useAuth } from '../../../app/providers/AuthContext'
import { useNavigate } from 'react-router'
import { useMyEnrollments } from '@/features/courses/hooks/useEnrollment.hook'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CircleUser } from 'lucide-react';

function StudentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { enrollments, loading } = useMyEnrollments();
    return (
        <>
            <div className="min-h-screen bg-muted/40">
                <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">Plataforma de cursos</h1>
                    <div className="flex items-center gap-4">
                        <CircleUser />
                        <span className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</span>
                        <Button variant="destructive" size="sm" onClick={logout} className="hover:cursor-pointer">
                            Cerrar sesión
                        </Button>
                    </div>
                </nav>
                <div className="max-w-5xl mx-auto px-8 py-10">
                    <h2 className="text-2xl font-bold mb-2">Bienvenido, {user?.firstName}!</h2>
                    <p className="text-muted-foreground mb-8">Continúa aprendiendo donde lo dejaste</p>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Mis cursos</h3>
                        <div className="flex justify-end">
                            <Button onClick={() => navigate('/catalog')} className="hover:cursor-pointer">
                                Explorar cursos
                            </Button>
                            <Button onClick={() => navigate('/certificates')} className="hover:cursor-pointer">
                                Ver certificados
                            </Button>
                        </div>
                    </div>
                    {loading ? (
                        <p className="text-muted-foreground">Cargando...</p>
                    ) : enrollments.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground mb-4">No estás inscrito en ningún curso todavía.</p>
                                <Button onClick={() => navigate('/catalog')} className="hover:cursor-pointer">
                                    Ver catálogo
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {enrollments.map(enrollment => (
                                <Card key={enrollment.id} className="hover:shadow-md transition cursor-pointer"
                                    onClick={() => navigate(`/courses/${enrollment.courseId}`)}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">{enrollment.course?.title ?? `Curso #${enrollment.courseId}`}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                            <span>Progreso</span>
                                            <span>{Number(enrollment.progressPercentage).toFixed(0)}%</span>
                                        </div>
                                        <Progress value={Number(enrollment.progressPercentage)} className="h-2" />
                                        {enrollment.completedAt && (
                                            <p className="text-xs text-green-600 mt-2">Completado</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default StudentDashboard;