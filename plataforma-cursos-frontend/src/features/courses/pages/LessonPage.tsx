import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/app/providers/AuthContext";
import { type Lesson, lessonService } from "../services/lessonService";
import { useCourse } from "../hooks/useCourses.hook";
import { useLessons } from "../hooks/useLessons.hook";
import LessonForm from "../components/LessonForm";
import { type LessonFormData } from "../components/LessonForm";
import LessonList from "../components/LessonList";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import { ArrowLeft, Plus, Eye, Trash2 } from "lucide-react";
import {
  examService,
  type Exam,
  type ExamQuestionWithAnswer,
} from "@/features/exams/services/examService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function LessonPage() {
  const { logout } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course } = useCourse(Number(courseId));
  const { lessons, setLessons, loading } = useLessons(Number(courseId));
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestionWithAnswer[]>(
    [],
  );
  const [showExamModal, setShowExamModal] = useState(false);
  const [confirmDeleteExamOpen, setConfirmDeleteExamOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  useEffect(() => {
    examService
      .getMyExams()
      .then((data) => {
        setAllExams(data);
        if (data.length > 0) {
          setSelectedExam(data[0]);
        } else {
          setSelectedExam(null);
        }
      })
      .catch((err) => console.error("Error cargando exámenes", err));
  }, []);

  useEffect(() => {
    if (selectedExam && selectedExam.id && selectedExam.id !== "my") {
      examService
        .getOne(selectedExam.id)
        .then((fullExam) => setExamQuestions(fullExam.questions || []))
        .catch((err) => console.error("Error cargando preguntas", err));
    }
  }, [selectedExam]);

  const openCreateForm = () => {
    setEditingLesson(null);
    setShowForm(true);
  };

  const openEditForm = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleSubmit = async (data: LessonFormData) => {
    try {
      if (editingLesson) {
        const updateLesson = await lessonService.update(
          Number(courseId),
          editingLesson.id,
          data,
        );
        setLessons(
          lessons.map((l) => (l.id === updateLesson.id ? updateLesson : l)),
        );
      } else {
        const newLesson = await lessonService.create(Number(courseId), data);
        setLessons([...lessons, newLesson]);
      }

      setShowForm(false);
      setEditingLesson(null);
      setFormError("");
    } catch (error: any) {
      setFormError(
        error.response?.data?.message || "Error al guardar la lección",
      );
    }
  };

  const handleDelete = async (lessonId: string) => {
    setLessonToDelete(lessonId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!lessonToDelete) return;
    await lessonService.remove(Number(courseId), lessonToDelete);
    setLessons((prev) => prev.filter((l) => l.id !== lessonToDelete));
    setConfirmOpen(false);
    setLessonToDelete(null);
  };

  const handleDeleteExam = (exam: Exam) => {
    setExamToDelete(exam);
    setConfirmDeleteExamOpen(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    try {
      await examService.deleteExam(examToDelete.id);
      const updatedExams = allExams.filter((e) => e.id !== examToDelete.id);
      setAllExams(updatedExams);
      if (selectedExam?.id === examToDelete.id) {
        setSelectedExam(updatedExams.length > 0 ? updatedExams[0] : null);
      }
    } catch (error) {
      console.error("Error al eliminar examen", error);
      alert("No se pudo eliminar el examen");
    } finally {
      setConfirmDeleteExamOpen(false);
      setExamToDelete(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-muted/40">
        <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
          <Button
            size="sm"
            onClick={() => navigate("/creator-dashboard")}
            className="hover:cursor-pointer"
          >
            <ArrowLeft size={16} /> Volver
          </Button>
          <h1 className="text-xl font-bold text-primary">Lecciones</h1>
          <Button
            variant="destructive"
            size="sm"
            onClick={logout}
            className="hover:cursor-pointer"
          >
            Cerrar sesión
          </Button>
        </nav>

        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">{course?.title}</h2>
              <p className="text-muted-foreground text-sm">
                Gestiona las lecciones de este curso
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={openCreateForm} size="sm">
                <Plus className="mr-1 h-4 w-4" /> Nueva lección
              </Button>
              <Button
                onClick={() =>
                  navigate(`/creator/courses/${courseId}/exam/new`)
                }
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" /> Nuevo examen (este curso)
              </Button>
            </div>
          </div>

          {allExams.length > 0 && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/20">
              <h3 className="text-sm font-semibold mb-2">
                Tus exámenes (todos los cursos)
              </h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Select
                  value={selectedExam?.id}
                  onValueChange={(examId) => {
                    const exam = allExams.find((e) => e.id === examId);
                    setSelectedExam(exam || null);
                  }}
                >
                  <SelectTrigger className="w-72">
                    <SelectValue placeholder="Selecciona un examen" />
                  </SelectTrigger>
                  <SelectContent>
                    {allExams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title} –{" "}
                        {exam.course?.title || "Curso sin título"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedExam && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExamModal(true)}
                    >
                      <Eye className="mr-1 h-4 w-4" /> Ver examen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/creator/courses/${courseId}/exam/edit/${selectedExam.id}`,
                        )
                      }
                    >
                      Editar examen
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteExam(selectedExam)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Eliminar examen
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {allExams.length === 0 && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/20 text-center text-muted-foreground">
              No tienes exámenes creados en ningún curso. Crea uno usando "Nuevo
              examen (este curso)".
            </div>
          )}

          {showForm && (
            <LessonForm
              editingLesson={editingLesson ?? undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setFormError("");
              }}
              error={formError}
            />
          )}

          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : lessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No hay lecciones todavía.
                </p>
                <Button
                  onClick={openCreateForm}
                  className="hover:cursor-pointer"
                >
                  Crear primera lección
                </Button>
              </CardContent>
            </Card>
          ) : (
            <LessonList
              lessons={lessons}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <Dialog open={showExamModal} onOpenChange={setShowExamModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedExam?.title}</DialogTitle>
            <DialogDescription>
              Puntaje mínimo: <strong>{selectedExam?.passingScore}%</strong>
              {selectedExam?.course && (
                <> – Curso: {selectedExam.course.title}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {examQuestions.length === 0 ? (
              <p className="text-muted-foreground">
                No hay preguntas en este examen.
              </p>
            ) : (
              examQuestions.map((q, idx) => (
                <Card key={q.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-base">
                        {idx + 1}. {q.question}
                      </h3>
                      <Badge variant="outline">{q.points} pts</Badge>
                    </div>
                    <div className="space-y-1 mt-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              q.correctAnswer === optIdx
                                ? "bg-green-500"
                                : "bg-muted-foreground"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              q.correctAnswer === optIdx
                                ? "font-medium text-green-700"
                                : ""
                            }`}
                          >
                            {opt}
                          </span>
                          {q.correctAnswer === optIdx && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Correcta
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar lección"
        description="¿Estás seguro de que quieres eliminar esta lección? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setLessonToDelete(null);
        }}
      />

      <ConfirmDialog
        open={confirmDeleteExamOpen}
        title="Eliminar examen"
        description={`¿Estás seguro de que quieres eliminar el examen "${examToDelete?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={confirmDeleteExam}
        onCancel={() => {
          setConfirmDeleteExamOpen(false);
          setExamToDelete(null);
        }}
      />
    </>
  );
}

export default LessonPage;
