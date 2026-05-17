import { useState, useEffect } from 'react';
import { enrollmentService, type Enrollment } from '../services/enrollmentService';

// Devuelve las inscripciones del usuario actual. 
export function useMyEnrollments() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        enrollmentService.getMyEnrollments()
            .then(setEnrollments)
            .catch(() => setError('Error al cargar las inscripciones'))
            .finally(() => setLoading(false));
    }, []);

    return { enrollments, setEnrollments, loading, error };
}