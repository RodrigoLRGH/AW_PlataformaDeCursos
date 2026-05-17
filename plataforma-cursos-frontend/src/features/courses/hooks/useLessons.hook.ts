import { useState, useEffect } from 'react'
import { lessonService, type Lesson } from '../services/lessonService'

// Devuelve las lecciones de un curso ordenadas por order
export function useLessons(courseId: number) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lessonService.getByCourse(courseId)
      .then(setLessons)
      .catch(() => setError('Error al cargar las lecciones'))
      .finally(() => setLoading(false))
  }, [courseId])

  return { lessons, setLessons, loading, error }
}