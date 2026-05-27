import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Lesson } from "../services/lessonService";
import { Trash2, Edit } from "lucide-react";

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
              <p className="text-xs text-muted-foreground">
                {lesson.durationMinutes} min
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(lesson)}
            className="hover:cursor-pointer"
          >
            <Edit className="mr-1 h-4 w-4" /> Editar
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(lesson.id)}
            className="hover:cursor-pointer"
          >
            <Trash2 className="mr-1 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

export default LessonCard;
