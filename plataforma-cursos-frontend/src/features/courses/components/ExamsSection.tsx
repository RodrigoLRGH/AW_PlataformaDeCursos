import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit, Trash2 } from "lucide-react";
import { type Exam } from "@/features/exams/services/examService";

interface ExamsSectionProps {
  exams: Exam[];
  onViewExam: (exam: Exam) => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (exam: Exam) => void;
}

export function ExamsSection({
  exams,
  onViewExam,
  onEditExam,
  onDeleteExam,
}: ExamsSectionProps) {
  if (exams.length === 0) {
    return (
      <div className="mb-6 p-4 border rounded-lg bg-muted/20 text-center text-muted-foreground">
        No hay exámenes asociados a este curso. Crea uno usando "Nuevo examen
        (este curso)".
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3">Exámenes de este curso</h3>
      <div className="space-y-3">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{exam.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewExam(exam)}
                >
                  <Eye className="mr-1 h-4 w-4" /> Ver examen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditExam(exam)}
                >
                  <Edit className="mr-1 h-4 w-4" /> Editar examen
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteExam(exam)}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar examen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Puntaje mínimo: {exam.passingScore}%
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
