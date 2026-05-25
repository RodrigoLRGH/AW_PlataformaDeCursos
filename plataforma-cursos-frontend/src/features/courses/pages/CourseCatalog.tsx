import { useState, useMemo } from "react";
import { useAuth } from "../../../app/providers/AuthContext";
import { useCourses } from "../hooks/useCourses.hook";
import CourseCard from "../components/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

function CourseCatalog() {
  const { logout } = useAuth();
  const { courses, loading, error } = useCourses(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const navigate = useNavigate();

  // Obtener lista única de categorías de los cursos
  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [courses]);

  const filteredCourses = courses.filter((course) => {
    if (!course) return false;
    const matchSearch = course.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCategory = category ? course.category === category : true;
    const matchLevel = level ? course.level === level : true;
    return matchSearch && matchCategory && matchLevel;
  });

  return (
    <div className="min-h-screen bg-muted/40">
      <nav className="bg-background shadow px-8 py-4 flex justify-between items-center">
        <Button
          size="sm"
          onClick={() => navigate(-1)}
          className="hover:cursor-pointer"
        >
          <ArrowLeft size={16} /> Volver
        </Button>
        <h1 className="text-xl font-bold text-primary">Plataforma de cursos</h1>
        <Button
          variant="destructive"
          size="sm"
          onClick={logout}
          className="hover:cursor-pointer"
        >
          Cerrar sesión
        </Button>
      </nav>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Catálogo de cursos</h2>
          <p className="text-muted-foreground">
            Encuentra el curso que estás buscando
          </p>
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <Input
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48"
          />

          {/* Select para nivel - independiente */}
          <Select
            value={level}
            onValueChange={(val) => setLevel(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos los niveles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              <SelectItem value="beginner">Principiante</SelectItem>
              <SelectItem value="intermediate">Intermedio</SelectItem>
              <SelectItem value="advanced">Avanzado</SelectItem>
            </SelectContent>
          </Select>

          {/* Select para categoría - independiente */}
          <Select
            value={category}
            onValueChange={(val) => setCategory(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <p className="text-destructive text-center py-12">{error}</p>
        ) : loading ? (
          <p className="text-muted-foreground text-center py-12">
            Cargando cursos...
          </p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No se encontraron cursos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCatalog;
