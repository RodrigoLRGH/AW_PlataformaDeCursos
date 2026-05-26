import { useState, useEffect } from "react";
import { courseService, type Course } from "../services/courseService";

export function useCourses(published?: boolean) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    courseService
      .getAll(published)
      .then(setCourses)
      .catch(() => setError("Error al cargar los cursos"))
      .finally(() => setLoading(false));
  }, [published]);

  return { courses, setCourses, loading, error };
}

export function useMyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    courseService
      .getMyCourses()
      .then(setCourses)
      .catch(() => setError("Error al cargar los cursos"))
      .finally(() => setLoading(false));
  }, []);

  return { courses, setCourses, loading, error };
}

export function useCourse(id: number) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    courseService
      .getOne(id)
      .then(setCourse)
      .catch(() => setError("Error al cargar el curso"))
      .finally(() => setLoading(false));
  }, [id]);

  return { course, loading, error };
}
