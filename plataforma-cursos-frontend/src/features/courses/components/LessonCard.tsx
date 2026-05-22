import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Lesson } from "../services/lessonService";

interface Props {
    lesson: Lesson;
    onEdit: (lesson: Lesson) => void;
    onDelete: (lessonId: string) => void;
}

function LessonCard({ lesson, onEdit, onDelete }: Props) {

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-3">
                    <Badge variant="outline">#{lesson.order ?? 0}</Badge>
                    <div>
                        <p className="font-medium">{lesson.title}</p>
                        {lesson.durationMinutes ? (
                            <p className="text-xs text-muted-foreground">{lesson.durationMinutes} min</p>
                        ) : null}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(lesson)} className="hover:cursor-pointer">
                        Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(lesson.id)} className="hover:cursor-pointer">
                        Eliminar
                    </Button>
                </div>
            </CardHeader>
        </Card>
    )
}

export default LessonCard;