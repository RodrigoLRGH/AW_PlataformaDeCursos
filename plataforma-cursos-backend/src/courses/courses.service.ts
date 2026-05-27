import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) { }


  async findAll(isPublished?: boolean) {
    const where: { status?: CourseStatus } = {};
    if (isPublished !== undefined) {
      where.status = isPublished ? CourseStatus.PUBLISHED : CourseStatus.DRAFT;
    }
    return this.courseRepo.find({ where });
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!course) throw new NotFoundException('Curso no encontrado');
    return course;
  }

  async findByCreator(creatorId: number) {
    return this.courseRepo.find({
      where: { creatorId },
      relations: ['lessons'],
    });
  }

  async create(dto: CreateCourseDto, creatorId: number) {
    const course = this.courseRepo.create({ ...dto, creatorId });
    return this.courseRepo.save(course);
  }

  
  async update(id: number, dto: UpdateCourseDto, userId: number) {
    const course = await this.findOne(id);

    if (Number(course.creatorId) !== Number(userId)) {
      throw new ForbiddenException('No autorizado para eliminar este curso')
    }

    const updatedCourse = await this.courseRepo.preload({ id, ...dto });
    if (!updatedCourse) throw new NotFoundException('Curso no encontrado');
    return this.courseRepo.save(updatedCourse);
  }

  async remove(id: number, userId: number) {
    const course = await this.findOne(id);

    if (Number(course.creatorId) !== Number(userId)) {
      throw new ForbiddenException('No autorizado para eliminar este curso')
    }
    await this.courseRepo.remove(course);
    return { message: 'Curso eliminado' };
  }
}