import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

// Endpoint para gestion de cursos
@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // GET /courses
  // Devuelve los cursos publicados
  @Get()
  @ApiOperation({ summary: 'Listar cursos publicados' })
  @ApiResponse({ status: 200, description: 'Lista de cursos' })
  findAll() {
    return this.coursesService.findAll(true);
  }

  // GET /courses/my 
  // Devuelve los cursos creados por el creador autenticado, con sus lecciones
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis cursos (creator)' })
  findMy(@Request() req: { user: { id: number } }) {
    return this.coursesService.findByCreator(req.user.id);
  }

  // GET /courses/:id
  // Devuelve un curso por ID 
  @Get(':id')
  @ApiOperation({ summary: 'Obtener curso por ID' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  // POST /courses
  // Crea un curso, solo para usuarios con rol CREATOR
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear curso' })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente.' })
  create(@Body() dto: CreateCourseDto, @Request() req: { user: { id: number } }) {
    return this.coursesService.create(dto, req.user.id);
  }

  // PUT /courses/:id
  // Actualiza un curso. Solo el creador del curso puede modificarlo
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar curso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
    @Request() req: { user: { id: number } },
  ) {
    return this.coursesService.update(id, dto, req.user.id);
  }

  // DELETE /courses/:id
  // Elimina un curso. Solo el creador del curso puede eliminarlo
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar curso' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: { user: { id: number } }) {
    return this.coursesService.remove(id, req.user.id);
  }
}
