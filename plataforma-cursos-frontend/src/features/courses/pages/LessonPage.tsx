import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthContext";
import { type Lesson, lessonService } from "../services/lessonService";
import { useCourse } from "../hooks/useCourses.hook";
import { useLessons } from "../hooks/useLessons.hook";
import LessonForm from "../components/LessonForm";
import { type LessonFormData } from "../components/LessonForm";
import LessonList from "../components/LessonList";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import { ArrowLeft } from "lucide-react";
import {
  examService,
  type Exam,
  type ExamQuestionWithAnswer,
} from "@/features/exams/services/examService";
import { useCourseExams } from "../hooks/useCourseExams";
import { CourseHeader } from "../components/CourseHeader";
import { ExamsSection } from "../components/ExamsSection";
import { EmptyLessonsState } from "../components/EmptyLessonsState";
import { ExamPreviewDialog } from "../components/ExamPreviewDialog";

function LessonPage() {
  const { logout } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const numericCourseId = Number(courseId);

  const { course } = useCourse(numericCourseId);
  const { lessons, setLessons, loading } = useLessons(numericCourseId);

  const { courseExams, deleteExam } = useCourseExams(numericCourseId);

  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formError, setFormError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);

  const [showExamModal, setShowExamModal] = useState(false);
  const [confirmDeleteExamOpen, setConfirmDeleteExamOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  const [examForModal, setExamForModal] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestionWithAnswer[]>(
    [],
  );

  useEffect(() => {
    if (examForModal?.id) {
      examService
        .getOne(examForModal.id)
        .then((fullExam) => setExamQuestions(fullExam.questions || []))
        .catch((err) => console.error("Error cargando preguntas", err));
    } else {
      setExamQuestions([]);
    }
  }, [examForModal]);

  const openCreateForm = () => {
    setEditingLesson(null);
    setShowForm(true);
  };

  const openEditFormLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleSubmitLesson = async (data: LessonFormData) => {
    try {
      if (editingLesson) {
        const updateLesson = await lessonService.update(
          numericCourseId,
          editingLesson.id,
          data,
        );
        setLessons(
          lessons.map((l) => (l.id === updateLesson.id ? updateLesson : l)),
        );
      } else {
        const newLesson = await lessonService.create(numericCourseId, data);
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

  const handleDeleteLesson = async (lessonId: string) => {
    setLessonToDelete(lessonId);
    setConfirmOpen(true);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;
    await lessonService.remove(numericCourseId, lessonToDelete);
    setLessons((prev) => prev.filter((l) => l.id !== lessonToDelete));
    setConfirmOpen(false);
    setLessonToDelete(null);
  };

  const handleViewExam = (exam: Exam) => {
    setExamForModal(exam);
    setShowExamModal(true);
  };

  const handleEditExam = (exam: Exam) => {
    navigate(`/creator/courses/${courseId}/exam/edit/${exam.id}`);
  };

  const handleDeleteExam = (exam: Exam) => {
    setExamToDelete(exam);
    setConfirmDeleteExamOpen(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    try {
      await deleteExam(examToDelete.id);
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
          <CourseHeader
            courseTitle={course?.title}
            onNewLesson={openCreateForm}
            onNewExam={() => navigate(`/creator/courses/${courseId}/exam/new`)}
          />
          <ExamsSection
            exams={courseExams}
            onViewExam={handleViewExam}
            onEditExam={handleEditExam}
            onDeleteExam={handleDeleteExam}
          />

          {showForm && (
            <LessonForm
              editingLesson={editingLesson ?? undefined}
              onSubmit={handleSubmitLesson}
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
            <EmptyLessonsState onCreateFirst={openCreateForm} />
          ) : (
            <LessonList
              lessons={lessons}
              onEdit={openEditFormLesson}
              onDelete={handleDeleteLesson}
            />
          )}
        </div>
      </div>

      <ExamPreviewDialog
        open={showExamModal}
        onOpenChange={setShowExamModal}
        exam={examForModal}
        questions={examQuestions}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar lección"
        description="¿Estás seguro de que quieres eliminar esta lección? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={confirmDeleteLesson}
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
