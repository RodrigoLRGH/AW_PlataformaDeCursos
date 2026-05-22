import {
  Controller, Post, Get, Param, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
@ApiTags('Progress')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) { }

  // Marcar lección como completada
  @Post('lessons/:lessonId/complete')
  markComplete(@Param('lessonId') lessonId: string, @Request() req) {
    return this.progressService.markLessonCompleted(req.user.sub, lessonId)
  };

  // Obtener progreso en un curso específico
  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Progreso en un curso' })
  getProgress(@Param('courseId', ParseIntPipe) courseId: number, @Request() req) {
    return this.progressService.getProgressByCourse(req.user.sub, courseId);
  }
}
