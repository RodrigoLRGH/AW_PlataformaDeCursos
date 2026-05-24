import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
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
  ) { }

  // Marcar una lección como completada, actualiza el progreso del curso y marca el curso como completado si se han completado todas las lecciones
  async markLessonCompleted(userId: number, lessonId: string) {
    return this.dataSource.transaction(async (manager) => {
      const lesson = await manager.findOne(Lesson, {
        where: { id: lessonId },
      });
      if (!lesson) throw new NotFoundException('Lección no encontrada');

      const enrollment = await manager.findOne(Enrollment, {
        where: { userId, courseId: lesson.courseId },
      });
      if (!enrollment)
        throw new ForbiddenException('No estás inscrito en este curso');

      let progress = await manager.findOne(Progress, {
        where: { userId, lessonId },
      });

      if (!progress) {
        progress = manager.create(Progress, {
          userId,
          lessonId,
          completed: true,
        });
      } else {
        progress.completed = true;
      }
      await manager.save(progress);

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
      where: { courseId },
    });
    const lessonIds = lessons.map((l) => l.id);

    if (lessonIds.length === 0) return [];

    const completed = await this.progressRepo.find({
      where: {
        userId,
        lessonId: In(lessonIds),
        completed: true,
      },
    });

    const completedIds = new Set(completed.map((p) => String(p.lessonId)));

    return lessons.map((lesson) => ({
      lessonId: lesson.id,
      title: lesson.title,
      completed: completedIds.has(String(lesson.id)),
    }));
  }
}
