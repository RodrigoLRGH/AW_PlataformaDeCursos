import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../courses/entities/course.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

// Gestion de lecciones: creación, actualización, eliminación y consulta por curso.
@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
  ) { }

  // Deuelve todas las lecciones de un curso ordenadas por su campo 'order'
  async findByCourse(courseId: number) {
    return this.lessonRepo.find({
      where: { courseId },
      order: { order: 'ASC' },
    });
  }

  // Deuelve una lección por su ID
  // Lanza una excepción si no se encuentra la lección
  async findOne(id: string) {
    const lesson = await this.lessonRepo.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Lección no encontrada');
    return lesson;
  }

  // Crea una leccion en un curso. Solo el creador del curso puede agregar lecciones
  // Lanza ForbiddenException si el usuario no es el creador del curso
  async create(courseId: number, dto: CreateLessonDto, userId: number) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } })
    console.log('course.creatorId:', course?.creatorId, typeof course?.creatorId)
    console.log('userId:', userId, typeof userId)
    if (!course) throw new NotFoundException('Curso no encontrado')
    if (Number(course.creatorId) !== Number(userId)) {
      throw new ForbiddenException('No autorizado')
    }

    const lesson = this.lessonRepo.create({ ...dto, courseId });
    return this.lessonRepo.save(lesson);
  }
  // Actualiza una lección existente
  async update(id: string, dto: UpdateLessonDto) {
    const lesson = await this.findOne(id);
    Object.assign(lesson, dto);
    return this.lessonRepo.save(lesson);
  }

  // Elimina una lección por su ID
  async remove(id: string) {
    return await this.lessonRepo.delete({ id });
  }

}
