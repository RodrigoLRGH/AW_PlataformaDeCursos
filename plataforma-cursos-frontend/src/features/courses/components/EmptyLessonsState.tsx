import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyLessonsStateProps {
  onCreateFirst: () => void;
}

export function EmptyLessonsState({ onCreateFirst }: EmptyLessonsStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-muted-foreground mb-4">No hay lecciones todavía.</p>
        <Button onClick={onCreateFirst} className="hover:cursor-pointer">
          Crear primera lección
        </Button>
      </CardContent>
    </Card>
  );
}
