import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm'; // Importamos In
import { Progress } from './entities/progress.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Lesson } from '../lessons/entities/lesson.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress) private progressRepo: Repository<Progress>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    private dataSource: DataSource,
  ) {}

  async markLessonCompleted(userId: number, lessonId: number) {
    return this.dataSource.transaction(async (manager) => {
      // CORRECCIÓN: Conversión de lessonId a string para la búsqueda
      const lesson = await manager.findOne(Lesson, {
        where: { id: lessonId.toString() } as any,
      });
      if (!lesson) throw new NotFoundException('Lección no encontrada');

      const enrollment = await manager.findOne(Enrollment, {
        where: { userId, courseId: lesson.courseId },
      });
      if (!enrollment)
        throw new ForbiddenException('No estás inscrito en este curso');

      // Upsert progreso
      let progress = await manager.findOne(Progress, {
        where: { userId, lessonId: lessonId as any },
      });

      if (!progress) {
        progress = manager.create(Progress, {
          userId,
          lessonId: lessonId as any, // Asegurar que coincida con el tipo de la entidad
          completed: true,
        });
      } else {
        progress.completed = true;
      }
      await manager.save(progress);

      // Recalcular porcentaje
      const totalLessons = await manager.count(Lesson, {
        where: { courseId: lesson.courseId },
      });

      const completedLessons = await manager.count(Progress, {
        where: {
          userId,
          completed: true,
          lesson: { courseId: lesson.courseId },
        },
        relations: ['lesson'],
      });

      const percentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      enrollment.progressPercentage = percentage;
      // CORRECCIÓN: Usar completedAt en lugar de la propiedad inexistente 'completed'
      enrollment.completedAt = percentage === 100 ? new Date() : null;
      await manager.save(enrollment);

      return {
        progress,
        progressPercentage: percentage,
        courseCompleted: !!enrollment.completedAt,
      };
    });
  }

  async getProgressByCourse(userId: number, courseId: number) {
    const lessons = await this.lessonRepo.find({
      where: { courseId: courseId.toString() as any },
    });
    const lessonIds = lessons.map((l) => l.id);

    if (lessonIds.length === 0) return [];

    // CORRECCIÓN: Simplificación de la búsqueda usando In() para evitar errores de mapeo
    const completed = await this.progressRepo.find({
      where: {
        userId,
        lessonId: In(lessonIds),
        completed: true,
      },
    });

    // CORRECCIÓN: Asegurar que el Set compare tipos consistentes (usamos String para mayor seguridad)
    const completedIds = new Set(completed.map((p) => String(p.lessonId)));

    return lessons.map((lesson) => ({
      lessonId: lesson.id,
      title: lesson.title,
      // Comparamos strings para evitar fallos si uno es number y el otro string
      completed: completedIds.has(String(lesson.id)),
    }));
  }
}
