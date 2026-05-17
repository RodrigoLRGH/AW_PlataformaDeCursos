import {
  Controller, Post, Get, Param, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('lessons/:lessonId/complete')
  @ApiOperation({ summary: 'Marcar lección como completada' })
  markComplete(@Param('lessonId', ParseIntPipe) lessonId: number, @Request() req) {
    return this.progressService.markLessonCompleted(req.user.id, lessonId);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Progreso en un curso' })
  getProgress(@Param('courseId', ParseIntPipe) courseId: number, @Request() req) {
    return this.progressService.getProgressByCourse(req.user.id, courseId);
  }
}
