import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../courses/entities/course.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
  ) {}

  async findByCourse(courseId: number) {
    return this.lessonRepo.find({
      where: { courseId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.lessonRepo.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Lección no encontrada');
    return lesson;
  }

  async create(courseId: number, dto: CreateLessonDto, userId: number) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    console.log(
      'course.creatorId:',
      course?.creatorId,
      typeof course?.creatorId,
    );
    console.log('userId:', userId, typeof userId);
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (Number(course.creatorId) !== Number(userId)) {
      throw new ForbiddenException('No autorizado');
    }

    const lesson = this.lessonRepo.create({ ...dto, courseId });
    return this.lessonRepo.save(lesson);
  }
  async update(
    id: string,
    courseId: number,
    userId: number,
    dto: UpdateLessonDto,
  ) {
    const lesson = await this.findOne(id);
    if (lesson.courseId !== courseId) {
      throw new ForbiddenException(
        'La lección no pertenece al curso especificado',
      );
    }
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (Number(course.creatorId) !== Number(userId)) {
      throw new ForbiddenException(
        'No autorizado para modificar lecciones de este curso',
      );
    }
    Object.assign(lesson, dto);
    return this.lessonRepo.save(lesson);
  }

  async remove(id: string, courseId: number, userId: number) {
    const lesson = await this.findOne(id);
    if (lesson.courseId !== courseId) {
      throw new ForbiddenException(
        'La lección no pertenece al curso especificado',
      );
    }
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (Number(course.creatorId) !== Number(userId)) {
      throw new ForbiddenException(
        'No autorizado para eliminar lecciones de este curso',
      );
    }
    return await this.lessonRepo.delete({ id });
  }
}
