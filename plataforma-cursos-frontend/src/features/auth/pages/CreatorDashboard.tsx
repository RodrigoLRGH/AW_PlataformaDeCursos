import { useNavigate } from 'react-router'
import { useAuth } from '../../../app/providers/AuthContext'
import { courseService } from '../../courses/services/courseService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMyCourses } from '@/features/courses/hooks/useCourses.hook'
import { CircleUser, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'

function CreatorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { courses, setCourses, loading } = useMyCourses()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null)
  const { isDark, toggleTheme } = useTheme()

  const handleDelete = async (id: number) => {
    setCourseToDelete(id)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!courseToDelete) return
    await courseService.remove(courseToDelete)
    setCourses(prev => prev.filter(c => c.id !== courseToDelete))
    setConfirmOpen(false)
    setCourseToDelete(null)
  }

  return (
    <>
      <div className="min-h-screen bg-fondo">
        <nav className="bg-fondo-claro shadow px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primario">Panel del creador</h1>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primario">Mis cursos</h2>
              <p className="text-secundario">Gestiona tus cursos publicados y borradores</p>
            </div>
            <Button onClick={() => navigate('/creator/courses/new')} className="hover:cursor-pointer">
              <Plus />Nuevo curso
            </Button>
          </div>
          {loading ? (
            <p className="text-secundario">Cargando...</p>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-secundario mb-4">No tienes cursos todavía.</p>
                <Button onClick={() => navigate('/creator/courses/new')} className="hover:cursor-pointer">
                  Crear mi primer curso
                </Button>
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
                        <p className="text-sm text-secundario mt-1">{course.description}</p>
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
                      <Button variant="outline" size="sm"
                        onClick={() => navigate(`/creator/courses/${course.id}/lessons`)}>
                        Lecciones
                      </Button>
                      <Button variant="destructive" size="sm"
                        onClick={() => handleDelete(course.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog open={confirmOpen}
        title="Eliminar curso"
        description="¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false)
          setCourseToDelete(null)
        }}
      />
    </>
  )
}

export default CreatorDashboard;