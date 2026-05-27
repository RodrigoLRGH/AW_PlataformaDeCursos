import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CourseHeaderProps {
  courseTitle?: string;
  onNewLesson: () => void;
  onNewExam: () => void;
}

export function CourseHeader({
  courseTitle,
  onNewLesson,
  onNewExam,
}: CourseHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold">
          {courseTitle || "Curso sin título"}
        </h2>
        <p className="text-muted-foreground text-sm">
          Gestiona las lecciones de este curso
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onNewLesson} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Nueva lección
        </Button>
        <Button onClick={onNewExam} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Nuevo examen
        </Button>
      </div>
    </div>
  );
}
