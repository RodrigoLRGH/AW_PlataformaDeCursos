import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type Exam,
  type ExamQuestionWithAnswer,
} from "@/features/exams/services/examService";

interface ExamPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: Exam | null;
  questions: ExamQuestionWithAnswer[];
}

export function ExamPreviewDialog({
  open,
  onOpenChange,
  exam,
  questions,
}: ExamPreviewDialogProps) {
  if (!exam) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{exam.title}</DialogTitle>
          <DialogDescription>
            Puntaje mínimo: <strong>{exam.passingScore}%</strong>
            {exam.course && <> – Curso: {exam.course.title}</>}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {questions.length === 0 ? (
            <p className="text-muted-foreground">
              No hay preguntas en este examen.
            </p>
          ) : (
            questions.map((q, idx) => (
              <Card key={q.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-base">
                      {idx + 1}. {q.question}
                    </h3>
                    <Badge variant="outline">{q.points} pts</Badge>
                  </div>
                  <div className="space-y-1 mt-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            q.correctAnswer === optIdx
                              ? "bg-green-500"
                              : "bg-muted-foreground"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            q.correctAnswer === optIdx
                              ? "font-medium text-green-700"
                              : ""
                          }`}
                        >
                          {opt}
                        </span>
                        {q.correctAnswer === optIdx && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Correcta
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
