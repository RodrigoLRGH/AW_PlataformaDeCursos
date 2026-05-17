import { useNavigate } from 'react-router'
import { useAuth } from '../../../app/providers/AuthContext'
import { courseService } from '../../courses/services/courseService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMyCourses } from '@/features/courses/hooks/useCourses.hook'

function CreatorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { courses, setCourses, loading } = useMyCourses()


  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este curso?')) return
    await courseService.remove(id)
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Panel del creador</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</span>
          <Button variant="ghost" size="sm" onClick={logout}>Cerrar sesión</Button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Mis cursos</h2>
            <p className="text-muted-foreground">Gestiona tus cursos publicados y borradores</p>
          </div>
          <Button onClick={() => navigate('/creator/courses/new')}>
            + Nuevo curso
          </Button>
        </div>
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No tienes cursos todavía.</p>
              <Button onClick={() => navigate('/creator/courses/new')}>Crear mi primer curso</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {courses.map(course => (
              <Card key={course.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{course.description || 'Sin descripción'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                      {course.status === 'published' ? 'Publicado' : 'Borrador'}
                    </Badge>
                    <Button variant="outline" size="sm"
                      onClick={() => navigate(`/creator/courses/${course.id}/edit`)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm"
                      onClick={() => handleDelete(course.id)}>
                      Eliminar
                    </Button>
                    <Button variant="outline" size="sm"
                      onClick={() => navigate(`/creator/courses/${course.id}/lessons`)}>
                      Lecciones
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatorDashboard;