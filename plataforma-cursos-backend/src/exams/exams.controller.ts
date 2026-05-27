import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Put,
  UseInterceptors,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Exams')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Listar todos los exámenes del creador' })
  async getMyExams(@Request() req, @Query('courseId') courseId?: number) {
    return this.examsService.findByCreator(req.user.sub, courseId);
  }

  @Post('courses/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Crear examen para un curso' })
  @ApiResponse({ status: 201, description: 'Examen creado exitosamente.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para crear exámenes.',
  })
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateExamDto,
    @Request() req,
  ) {
    return this.examsService.create(courseId, dto, req.user.sub);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Exámen de un curso' })
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.examsService.findByCourse(courseId);
  }

  @Get(':id/questions')
  @ApiOperation({ summary: 'Preguntas del examen (sin respuestas)' })
  getQuestions(@Param('id') id: string) {
    return this.examsService.getQuestionsForStudent(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Enviar respuestas de examen' })
  @ApiResponse({
    status: 201,
    description: 'Examen enviado y resultado calculado.',
  })
  submit(@Param('id') id: string, @Body() dto: SubmitExamDto, @Request() req) {
    return this.examsService.submit(id, req.user.sub, dto);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Mis resultados de un examen' })
  getResults(@Param('id') id: string, @Request() req) {
    return this.examsService.getMyResults(req.user.sub, id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Eliminar examen' })
  remove(@Param('id') id: string, @Request() req) {
    return this.examsService.remove(id, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Obtener examen completo (con preguntas y respuestas correctas) – solo para creador',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  async findOne(@Param('id') id: string, @Request() req) {
    return this.examsService.findOneForCreator(id, req.user.sub);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Actualizar examen existente (incluye preguntas)' })
  async update(
    @Param('id') id: string,
    @Body() dto: CreateExamDto,
    @Request() req,
  ) {
    return this.examsService.update(id, dto, req.user.sub);
  }
}
