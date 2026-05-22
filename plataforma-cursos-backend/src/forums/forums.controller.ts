import { Controller, Get, Post, Body, Param, UseGuards, Request, } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ForumsService } from './forums.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@ApiTags('Forums')
@Controller('forums')
export class ForumsController {
  constructor(private forumsService: ForumsService) { }

  // Obtener threads de un curso específico
  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Threads de un curso' })
  getThreads(@Param('courseId') courseId: string
  ) {
    return this.forumsService.getThreadsByCourse(courseId);
  }

  // Obtener un thread específico con sus replies
  @Get('threads/:id')
  @ApiOperation({ summary: 'Thread con replies' })
  getThread(@Param('id') id: string
  ) {
    return this.forumsService.getThread(id);
  }

  // Crear thread, protegido por la estrategia de access token
  @Post('threads')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear thread' })
  createThread(@Body() dto: CreateThreadDto, @Request() req) {
    return this.forumsService.createThread(dto, req.user.sub
    );
  }

  // Responder a un thread, protegido por la estrategia de access token
  @Post('threads/:id/replies')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Responder a un thread' })
  createReply(
    @Param('id') id: string,
    @Body() dto: CreateReplyDto,
    @Request() req,
  ) {
    return this.forumsService.createReply(id, dto, req.user.sub
    );
  }
}
