import { useState, useEffect } from 'react'
import { courseService, type Course } from '../services/courseService'

// Devuelve todos los cursos si estan publicados

export function useCourses(published?: boolean) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    courseService.getAll(published)
      .then(setCourses)
      .catch(() => setError('Error al cargar los cursos'))
      .finally(() => setLoading(false))
  }, [published])

  return { courses, setCourses, loading, error }
}

// Devuelve los cursos del usuario logueado
export function useMyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    courseService.getMyCourses()
      .then(setCourses)
      .catch(() => setError('Error al cargar los cursos'))
      .finally(() => setLoading(false))
  }, [])

  return { courses, setCourses, loading, error }
}

// Devuelve un curso por id
export function useCourse(id: number) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    courseService.getOne(id)
      .then(setCourse)
      .catch(() => setError('Error al cargar el curso'))
      .finally(() => setLoading(false))
  }, [id])

  return { course, loading, error }
}
