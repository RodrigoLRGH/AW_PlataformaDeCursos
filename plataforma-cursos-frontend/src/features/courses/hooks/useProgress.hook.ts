import { useState, useEffect } from 'react';
import { progressService, type LessonProgress } from '../services/progressService';

export function useProgress(courseId: number) {
    const [progress, setProgress] = useState<LessonProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        progressService.getCourseProgress(courseId)
            .then(setProgress)
            .finally(() => setLoading(false));
    }, [courseId]);

    return { progress, loading, setProgress };
}