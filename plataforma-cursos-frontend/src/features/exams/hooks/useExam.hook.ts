import { useState, useEffect } from "react";
import {
  examService,
  type Exam,
  type ExamQuestion,
  type ExamResult,
} from "../services/examService";

// Devuelve el examen asociado a un curso.

export function useExamByCourse(courseId: number) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    examService
      .getByCourse(courseId)
      .then(setExam)
      .catch(() => setError("No se pudo cargar el examen"))
      .finally(() => setLoading(false));
  }, [courseId]);

  return { exam, loading, error };
}

// Devuelve las preguntas de un examen sin las respuestas correctas.

export function useExamQuestions(examId: string) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;
    examService
      .getQuestions(examId)
      .then(setQuestions)
      .catch(() => setError("No se pudieron cargar las preguntas"))
      .finally(() => setLoading(false));
  }, [examId]);

  return { questions, loading, error };
}

// Devuelve los resultados del usuario autenticado para un examen.

export function useExamResults(examId: string) {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;
    examService
      .getResults(examId)
      .then(setResults)
      .catch(() => setError("No se pudieron cargar los resultados"))
      .finally(() => setLoading(false));
  }, [examId]);

  return { results, loading, error };
}

// Devuelve el examen completo (con respuestas correctas) - solo para creador
export function useExam(examId: string) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;
    examService
      .getOne(examId)
      .then(setExam)
      .catch(() => setError("No se pudo cargar el examen"))
      .finally(() => setLoading(false));
  }, [examId]);

  return { exam, loading, error };
}
