import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseService } from "../services/courseService";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourse } from "../hooks/useCourses.hook";
import { useAuth } from "@/app/providers/AuthContext";
import { ArrowLeft, X } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Minimo 3 caracteres"),
  description: z.string().optional(),
  thumbnailUrl: z.string().url("URL invalida").optional().or(z.literal("")),
  price: z.number().min(0, "El precio no puede ser negativo"),
  category: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

type EditCourseFormData = z.infer<typeof schema>;

function EditCoursePage() {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { course, loading } = useCourse(Number(id));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<EditCourseFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description || "",
        thumbnailUrl: course.thumbnailUrl || "",
        price: Number(course.price),
        category: course.category || "",
        level: course.level as "beginner" | "intermediate" | "advanced",
        status: course.status as "draft" | "published",
      });
    }
  }, [course, reset]);

  const onSubmit = async (data: EditCourseFormData) => {
    try {
      await courseService.update(Number(id), data);
      navigate("/creator-dashboard");
    } catch (error) {
      setError("root", { message: "Error al actualizar curso" });
    }
  };

  if (loading)
    return (
      <p className="text-center py-12 text-muted-foreground">Cargando...</p>
    );

  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
        <Button
          size="sm"
          onClick={() => navigate("/creator-dashboard")}
          className="hover:cursor-pointer"
        >
          <ArrowLeft size={16} /> Volver
        </Button>
        <h1 className="text-xl font-bold text-primary">Editar curso</h1>
        <Button
          variant="destructive"
          size="sm"
          onClick={logout}
          className="hover:cursor-pointer"
        >
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
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-destructive text-sm">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  rows={4}
                  {...register("description")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="thumbnailUrl">URL de portada</Label>
                <Input id="thumbnailUrl" {...register("thumbnailUrl")} />
                {errors.thumbnailUrl && (
                  <p className="text-destructive text-sm">
                    {errors.thumbnailUrl.message}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="category">Categoría</Label>
                  <Input id="category" {...register("category")} />
                </div>
                <div className="space-y-1 flex-1">
                  <Label>Nivel</Label>
                  <Select
                    value={watch("level") ?? ""}
                    onValueChange={(val) =>
                      setValue(
                        "level",
                        val as "beginner" | "intermediate" | "advanced",
                      )
                    }
                  >
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
              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="price">Precio (MXN)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label>Estado</Label>
                  <Select
                    value={watch("status") ?? ""}
                    onValueChange={(val) =>
                      setValue("status", val as "draft" | "published")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {errors.root && (
                <p className="text-destructive text-sm text-center">
                  {errors.root.message}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/creator-dashboard")}
                >
                  <X size={16} /> Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditCoursePage;
