import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { forumService, type ForumThread } from "../services/forumService";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CircleUser } from "lucide-react";

const schema = z.object({
  title: z.string().min(5, "El titulo debe tener al menos 5 caracteres"),
  body: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type ThreadForm = z.infer<typeof schema>;

function ForumPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ThreadForm>({
    resolver: zodResolver(schema),
  });
  console.log("courseId:", courseId);

  useEffect(() => {
    forumService
      .getThreadsByCourse(Number(courseId))
      .then((data) => {
        console.log("threads:", data);
        setThreads(data);
      })
      .catch((err) => {
        console.log("error:", err.response?.status, err.response?.data);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const onSubmit = async (data: ThreadForm) => {
    try {
      const thread = await forumService.createThread({
        ...data,
        courseId: Number(courseId),
      });
      setThreads((prev) => [thread, ...prev]);
      reset();
      setShowForm(false);
    } catch (error) {
      setError("root", { message: "Error al crear el thread" });
    }
  };

  return (
    <>
      <div>
        <div className="min-h-screen bg-fondo">
          <nav className="bg-fondo-claro shadow px-8 py-4 flex justify-between items-center">
            <Button size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Volver al curso
            </Button>
            <h1 className="text-xl font-bold text-primario">Foro del curso</h1>
          </nav>
          <div className="max-w-4xl mx-auto px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-primario font-bold">Discusion</h2>
            </div>
            <p className="text-secundario">
              Participa en las discusiones del curso
            </p>

            <Button onClick={() => setShowForm(!showForm)} className=" mt-4">
              {showForm ? "Cancelar" : "Nuevo hilo"}
            </Button>
          </div>
          <div className="max-w-4xl mx-auto px-8 py-10">
            {showForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Crear nuevo hilo</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                      <Label>Titulo</Label>
                      <Input
                        placeholder="Titulo del hilo"
                        {...register("title")}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label>Contenido</Label>
                      <Textarea
                        rows={4}
                        placeholder="Escribe tu pregunta o comentario..."
                        {...register("body")}
                      />
                      {errors.body && (
                        <p className="text-sm text-red-600">
                          {errors.body.message}
                        </p>
                      )}
                    </div>
                    {errors.root && (
                      <p className="text-sm text-red-600">
                        {errors.root.message}
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? "Creando..." : "Crear hilo"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
            {loading ? (
              <p className="text-center py-12 text-secundario">Cargando...</p>
            ) : threads.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-secundario mb-4">
                    No hay discusiones aún.
                  </p>
                  <Button onClick={() => setShowForm(true)}>Crear hilo</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {threads.map((thread) => (
                  <Card
                    key={thread.id}
                    className="hover:shadow-md transition cursor-pointer"
                    onClick={() =>
                      navigate(`/forums/${courseId}/threads/${thread.id}`)
                    }
                  >
                    <CardHeader className="flex justify-start items-start">
                      <CircleUser />
                      <CardTitle className="text-xl font-fold">
                        {thread.author?.firstName} {thread.author?.lastName} —{" "}
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-start items-start">
                        <div>
                          <p className="text-lg font-semibold text-secundario">
                            {thread.title}
                          </p>
                          <p className="text-md text-secundario">
                            {thread.body}
                          </p>
                        </div>
                        {thread.isPinned && (
                          <Badge variant="default">Fijado</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ForumPage;
