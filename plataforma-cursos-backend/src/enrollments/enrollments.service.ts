import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  async enroll(userId: number, courseId: number) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Curso no encontrado');

    if (course.creatorId === userId) {
      throw new ForbiddenException('No puedes inscribirte en tu propio curso');
    }

    const existing = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    if (existing)
      throw new ConflictException('Ya estás inscrito en este curso');

    const enrollment = this.enrollmentRepo.create({ userId, courseId });
    return this.enrollmentRepo.save(enrollment);
  }

  async findMyEnrollments(userId: number) {
    return this.enrollmentRepo.find({
      where: { userId },
      relations: ['course', 'course.creator'],
      select: {
        course: {
          id: true,
          title: true,
          thumbnailUrl: true,
          creator: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findOne(userId: number, courseId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');
    return enrollment;
  }

  async isEnrolled(userId: number, courseId: number): Promise<boolean> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, courseId },
    });
    return !!enrollment;
  }
}
