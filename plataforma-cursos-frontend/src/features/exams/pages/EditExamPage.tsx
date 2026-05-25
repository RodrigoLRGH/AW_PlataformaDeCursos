import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  examService,
  type Exam,
  type ExamQuestionWithAnswer,
} from "../services/examService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/providers/AuthContext";
import { ArrowLeft } from "lucide-react";

interface QuestionForm {
  id?: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  points: number;
}

function EditExamPage() {
  const { logout } = useAuth();
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!examId) return;
    examService
      .getOne(examId)
      .then((exam: Exam & { questions?: ExamQuestionWithAnswer[] }) => {
        setTitle(exam.title);
        setPassingScore(exam.passingScore);
        if (exam.questions && exam.questions.length > 0) {
          const qs = exam.questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options as unknown as [string, string, string, string],
            correctAnswer: (q as ExamQuestionWithAnswer).correctAnswer,
            points: q.points,
          }));
          setQuestions(qs);
        } else {
          setQuestions([
            {
              question: "",
              options: ["", "", "", ""],
              correctAnswer: 0,
              points: 1,
            },
          ]);
        }
      })
      .catch(() => setError("No se pudo cargar el examen"))
      .finally(() => setLoading(false));
  }, [examId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0, points: 1 },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (
    index: number,
    field: keyof QuestionForm,
    value: any,
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options] as [string, string, string, string];
        options[oIndex] = value;
        return { ...q, options };
      }),
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) return setError("El título es requerido");
    if (questions.length === 0)
      return setError("Debes agregar al menos una pregunta");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        setError(
          `En la pregunta ${i + 1} no seleccionaste la respuesta correcta`,
        );
        return;
      }
    }

    setSubmitting(true);
    setError("");

    const payload = {
      title: title.trim(),
      passingScore: Number(passingScore),
      questions: questions.map((q, i) => ({
        question: q.question.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctAnswer: q.correctAnswer,
        points: q.points,
        order: i,
      })),
    };

    try {
      await examService.update(examId!, payload);
      navigate(`/creator/courses/${courseId}/lessons`);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (msg && msg.includes("correctAnswer")) {
        setError(
          "Revisa que hayas seleccionado la respuesta correcta en todas las preguntas",
        );
      } else {
        setError("Error al crear el examen. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center py-12">Cargando examen...</p>;

  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/creator/courses/${courseId}/lessons`)}
        >
          <ArrowLeft size={16} /> Volver
        </Button>
        <h1 className="text-xl font-bold text-primary">Editar examen</h1>
        <Button size="sm" onClick={logout}>
          Cerrar sesión
        </Button>
      </nav>
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del examen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Puntaje mínimo para aprobar (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {questions.map((q, qIndex) => (
          <Card key={qIndex}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Pregunta {qIndex + 1}</CardTitle>
              {questions.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                >
                  Eliminar
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Pregunta</Label>
                <Input
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, "question", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Opciones</Label>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === oIndex}
                      onChange={() =>
                        updateQuestion(qIndex, "correctAnswer", oIndex)
                      }
                      className="cursor-pointer"
                    />
                    <Input
                      value={opt}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      placeholder={`Opción ${oIndex + 1}`}
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Selecciona el radio de la respuesta correcta
                </p>
              </div>
              <div className="space-y-1">
                <Label>Puntos</Label>
                <Input
                  type="number"
                  min="1"
                  value={q.points}
                  onChange={(e) =>
                    updateQuestion(qIndex, "points", Number(e.target.value))
                  }
                  className="w-24"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={addQuestion} className="flex-1">
            + Agregar pregunta
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditExamPage;
