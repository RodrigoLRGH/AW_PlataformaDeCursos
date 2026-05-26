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
import { UpdateExamDto } from './dto/update-exam.dto';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

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
  async getMyExams(@Request() req) {
    return this.examsService.findByCreator(req.user.sub);
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
  getQuestions(@Param('id') id: string, @Request() req) {
    return this.examsService.getQuestionsForStudent(id, req.user.sub);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Enviar respuestas de examen' })
  submit(@Param('id') id: string, @Body() dto: SubmitExamDto, @Request() req) {
    return this.examsService.submit(id, req.user.sub, dto);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Mis resultados de un examen' })
  getResults(@Param('id') id: string, @Request() req) {
    return this.examsService.getMyResults(req.user.sub, id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Obtener examen completo (solo creador)' })
  @ApiResponse({ status: 200, description: 'Examen encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async getExam(@Param('id') id: string, @Request() req) {
    return this.examsService.getExamForCreator(id, req.user.sub);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @UseInterceptors(LoggingInterceptor)
  async updateExam(
    @Param('id') id: string,
    @Body() dto: UpdateExamDto,
    @Request() req,
  ) {
    return this.examsService.updateExam(id, req.user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CREATOR)
  @ApiOperation({ summary: 'Eliminar examen (solo creador)' })
  async deleteExam(@Param('id') id: string, @Request() req) {
    return this.examsService.deleteExam(id, req.user.sub);
  }
}
