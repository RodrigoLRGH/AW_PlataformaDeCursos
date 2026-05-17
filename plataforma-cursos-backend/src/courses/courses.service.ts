import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

//  Gestiona la creacion, consulta, actualizacion y eliminacion de cursos
@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  // Devuelve todos los cursos, con opcion de filtrar por estado (publicado o borrador)

  async findAll(isPublished?: boolean) {
    const where: {status?: CourseStatus} = {};
    if (isPublished !== undefined) {
      where.status = isPublished ? CourseStatus.PUBLISHED : CourseStatus.DRAFT;
    }
    return this.courseRepo.find({ where });
  }

  // Devuelve un curso por ID con la relacion creador cargada
  async findOne(id: number) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!course) throw new NotFoundException('Curso no encontrado');
    return course;
  }

  // Devuelve los cursos creados por un creador con sus lecciones
  async findByCreator(creatorId: number) {
    return this.courseRepo.find({
      where: { creatorId },
      relations: ['lessons'],
    });
  }

  // Crea un nuevo curso asociado al creador autenticado
  async create(dto: CreateCourseDto, creatorId: number) {
    const course = this.courseRepo.create({ ...dto, creatorId });
    return this.courseRepo.save(course);
  }

  // Actualiza un curso. Solo el creador del curso puede modificarlo
  // Lanza ForbiddenException si el usuario autenticado no es el creador del curso
  async update(id: number, dto: UpdateCourseDto, userId: number) {
    const course = await this.findOne(id);

    if (course.creatorId !== userId) {  
      throw new ForbiddenException('No autorizado para modificar este curso');
    }

    const updatedCourse = await this.courseRepo.preload({ id, ...dto });
    if (!updatedCourse) throw new NotFoundException('Curso no encontrado');
    return this.courseRepo.save(updatedCourse);
  }

  // Elimina un curso. Solo el creador del curso puede eliminarlo
  // Lanza ForbiddenException si el usuario autenticado no es el creador del curso
  async remove(id: number, userId: number) {
    const course = await this.findOne(id);
    
    if(course.creatorId !== userId) {
      throw new ForbiddenException('No autorizado para eliminar este curso');
    } 
    await this.courseRepo.remove(course);
    return { message: 'Curso eliminado' };
  }
}
