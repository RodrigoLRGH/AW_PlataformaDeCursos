import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdateLessonDto } from './dto/update-lesson.dto';

// Gestionar rutas anidadas
@ApiTags('Lessons')
@Controller('courses/:courseId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // GET /courses/:courseId/lessons - Listar lecciones de un curso
  @Get()
  @ApiOperation({ summary: 'Listar lecciones de un curso' })
  findAll(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.lessonsService.findByCourse(courseId);
  }

  // GET /courses/:courseId/lessons/:id - Obtener lección por ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener lección por ID' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  // POST /courses/:courseId/lessons - Crear lección (solo para creadores del curso)
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear lección' })
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateLessonDto,
    @Request() req,
  ) {
    return this.lessonsService.create(courseId, dto, req.user.sub);
  }

  // PUT /courses/:courseId/lessons/:id - Actualizar lección (solo para creadores del curso)
  @Put(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar lección' })
  update(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @Request() req,
  ) {
    return this.lessonsService.update(id, courseId, req.user.sub, dto);
  }

  // DELETE /courses/:courseId/lessons/:id - Eliminar lección (solo para creadores del curso)
  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar lección' })
  remove(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.lessonsService.remove(id, courseId, req.user.sub);
  }
}
