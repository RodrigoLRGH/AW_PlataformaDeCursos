import { type Lesson } from "../services/lessonService";
import LessonCard from "./LessonCard";

interface Props {
  lessons: Lesson[];
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
}

function LessonList({ lessons, onEdit, onDelete }: Props) {
  return (
    <>
      <div className="space-y-3">
        {[...lessons]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
      </div>
    </>
  );
}

export default LessonList;
