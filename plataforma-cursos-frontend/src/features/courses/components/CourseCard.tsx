import { type Course } from '../services/courseService'
import { useNavigate } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
    course: Course
}

const levelLabels: Record<string, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
}

function CourseCard({ course }: Props) {
    const navigate = useNavigate()
    if (!course) return null

    return (
        <Card className="hover:shadow-lg transition cursor-pointer overflow-hidden"
            onClick={() => navigate(`/courses/${course.id}`)}>
            {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title}
                    className="w-full h-44 object-cover" />
            ) : (
                <div className="w-full h-44 bg-muted flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                </div>
            )}
            <CardContent className="p-4 space-y-2">
                <h2 className="font-semibold text-base leading-tight line-clamp-2">{course.title}</h2>
                {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                )}
                <div className="flex gap-2 flex-wrap">
                    {course.category && <Badge variant="secondary">{course.category}</Badge>}
                    {course.level && <Badge variant="outline">{levelLabels[course.level] ?? course.level}</Badge>}
                </div>
                <p className="text-sm font-semibold text-primary">
                    {Number(course.price) === 0 ? 'Gratis' : `$${Number(course.price).toFixed(2)} MXN`}
                </p>
            </CardContent>
        </Card>
    )
}

export default CourseCard;