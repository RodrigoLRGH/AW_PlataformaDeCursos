import { useNavigate } from "react-router";
import { useAuth } from "../../../app/providers/AuthContext";
import { courseService } from "../../courses/services/courseService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyCourses } from "@/features/courses/hooks/useCourses.hook";
import { CircleUser, Plus } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import { Edit, Eye, Trash2 } from "lucide-react";

function CreatorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { courses, setCourses, loading } = useMyCourses();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setCourseToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    await courseService.remove(courseToDelete);
    setCourses((prev) => prev.filter((c) => c.id !== courseToDelete));
    setConfirmOpen(false);
    setCourseToDelete(null);
  };

  return (
    <>
      <div className="min-h-screen bg-muted/40">
        <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Panel del creador</h1>
          <div className="flex items-center gap-4">
            <CircleUser />
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
              className="hover:cursor-pointer"
            >
              Cerrar sesión
            </Button>
          </div>
        </nav>
        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Mis cursos</h2>
              <p className="text-muted-foreground">
                Gestiona tus cursos publicados y borradores
              </p>
            </div>
            <Button
              onClick={() => navigate("/creator/courses/new")}
              className="hover:cursor-pointer"
            >
              <Plus />
              Nuevo curso
            </Button>
          </div>
          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No tienes cursos todavía.
                </p>
                <Button
                  onClick={() => navigate("/creator/courses/new")}
                  className="hover:cursor-pointer"
                >
                  Crear mi primer curso
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">
                          {course.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          course.status === "published"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {course.status === "published"
                          ? "Publicado"
                          : "Borrador"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/creator/courses/${course.id}/edit`)
                        }
                      >
                        <Edit className="mr-1 h-2 w-4" /> Editar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/creator/courses/${course.id}/lessons`)
                        }
                      >
                        <Eye className="mr-1 h-2 w-4" /> Lecciones
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="mr-1 h-2 w-4" /> Eliminar
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar curso"
        description="¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setCourseToDelete(null);
        }}
      />
    </>
  );
}

export default CreatorDashboard;
