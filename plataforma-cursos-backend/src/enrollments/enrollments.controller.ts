import { Controller, Get, Post, Body, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../common/decorators/roles.decorator';

// Permite a los estudiantes inscribirse en cursos y consultar sus matriculas
@ApiTags('Enrollments')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // POST /enrollments
  // Inscribe al usuario autenticado en un curso específico
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Inscribirse en un curso' })
  @ApiResponse({ status: 201, description: 'Inscripción exitosa' })
  @ApiResponse({ status: 409, description: 'Ya estás inscrito en este curso' })
  enroll(@Body() dto: CreateEnrollmentDto, @Request() req) {
    return this.enrollmentsService.enroll(req.user.sub, dto.courseId);
  }

  // GET /enrollments/my
  // Devuelve las inscripciones del usuario autenticado
  @Get('my')
  @ApiOperation({ summary: 'Mis inscripciones' })
  findMy(@Request() req) {
    return this.enrollmentsService.findMyEnrollments(req.user.sub);
  }

  // GET /enrollments/check/:courseId 
  // Verifica si el usuario autenticado está inscrito en un curso específico
  @Get('check/:courseId')
  @ApiOperation({ summary: 'Verificar si estoy inscrito en un curso' })
  checkEnrollment(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Request() req,) {
    return this.enrollmentsService.isEnrolled(req.user.sub, courseId);
  }
}
