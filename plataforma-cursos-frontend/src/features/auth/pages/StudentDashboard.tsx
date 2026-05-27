import { useAuth } from '../../../app/providers/AuthContext'
import { useNavigate } from 'react-router'
import { useMyEnrollments } from '@/features/courses/hooks/useEnrollment.hook'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CircleUser, Sun, Moon } from 'lucide-react'

function StudentDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const { enrollments, loading } = useMyEnrollments()
    const { isDark, toggleTheme } = useTheme()

    return (
        <div className="min-h-screen bg-fondo">
            <nav className="bg-fondo-claro text-primario shadow px-8 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-primario">Plataforma de cursos</h1>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    <CircleUser />
                    <span className="text-sm text-secundario">{user?.firstName} {user?.lastName}</span>
                    <Button variant="destructive" size="sm" onClick={logout}>
                        Cerrar sesión
                    </Button>
                </div>
            </nav>
            <div className="max-w-5xl mx-auto px-8 py-10">
                <h2 className="text-2xl text-primario font-bold mb-2">Bienvenido, {user?.firstName}!</h2>
                <p className="text-secundario mb-8">Continúa aprendiendo donde lo dejaste</p>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg text-primario font-semibold">Mis cursos</h3>
                    <div className="flex gap-2">
                        <Button onClick={() => navigate('/catalog')}>
                            Explorar cursos
                        </Button>
                        <Button onClick={() => navigate('/certificates')}>
                            Ver certificados
                        </Button>
                    </div>
                </div>
                {loading ? (
                    <p className="text-secundario">Cargando...</p>
                ) : enrollments.length === 0 ? (
                    <Card className="bg-fondo-claro">
                        <CardContent className="py-12 text-center">
                            <p className="text-secundario mb-4">No estás inscrito en ningún curso todavía.</p>
                            <Button onClick={() => navigate('/catalog')}>
                                Ver catálogo
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {enrollments.map(enrollment => (
                            <Card
                                key={enrollment.id}
                                className="hover:shadow-md transition cursor-pointer"
                                onClick={() => navigate(`/courses/${enrollment.courseId}`)}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">
                                        {enrollment.course?.title ?? `Curso #${enrollment.courseId}`}
                                    </CardTitle>
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
    )
}

export default StudentDashboard