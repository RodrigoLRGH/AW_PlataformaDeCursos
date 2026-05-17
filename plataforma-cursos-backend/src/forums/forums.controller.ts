import {
  Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ForumsService } from './forums.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Forums')
@Controller('forums')
export class ForumsController {
  constructor(private forumsService: ForumsService) {}

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Threads de un curso' })
  getThreads(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.forumsService.getThreadsByCourse(courseId);
  }

  @Get('threads/:id')
  @ApiOperation({ summary: 'Thread con replies' })
  getThread(@Param('id', ParseIntPipe) id: number) {
    return this.forumsService.getThread(id);
  }

  @Post('threads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear thread' })
  createThread(@Body() dto: CreateThreadDto, @Request() req) {
    return this.forumsService.createThread(dto, req.user.id);
  }

  @Post('threads/:id/replies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Responder a un thread' })
  createReply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReplyDto,
    @Request() req,
  ) {
    return this.forumsService.createReply(id, dto, req.user.id);
  }
}
