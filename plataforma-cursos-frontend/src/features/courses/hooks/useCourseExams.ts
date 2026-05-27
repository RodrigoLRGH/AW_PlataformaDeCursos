import { useEffect, useState } from "react";
import {
  examService,
  type Exam,
  type ExamQuestionWithAnswer,
} from "@/features/exams/services/examService";

export function useCourseExams(courseId: number | undefined) {
  const [courseExams, setCourseExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestionWithAnswer[]>(
    [],
  );
  const [loadingExams, setLoadingExams] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoadingExams(true);
    examService
      .getMyExams(courseId)
      .then((data) => {
        setCourseExams(data);
        setSelectedExam(data.length > 0 ? data[0] : null);
      })
      .catch((err) => console.error("Error cargando exámenes del curso", err))
      .finally(() => setLoadingExams(false));
  }, [courseId]);

  useEffect(() => {
    if (selectedExam?.id) {
      examService
        .getOne(selectedExam.id)
        .then((fullExam) => setExamQuestions(fullExam.questions || []))
        .catch((err) => console.error("Error cargando preguntas", err));
    } else {
      setExamQuestions([]);
    }
  }, [selectedExam]);

  const deleteExam = async (examId: string) => {
    await examService.deleteExam(examId);
    const updatedExams = courseExams.filter((e) => e.id !== examId);
    setCourseExams(updatedExams);
    if (selectedExam?.id === examId) {
      setSelectedExam(updatedExams.length > 0 ? updatedExams[0] : null);
    }
  };

  return {
    courseExams,
    selectedExam,
    setSelectedExam,
    examQuestions,
    loadingExams,
    deleteExam,
  };
}
