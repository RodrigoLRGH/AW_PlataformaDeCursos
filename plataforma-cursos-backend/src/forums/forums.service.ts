import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { ForumThread } from './entities/forum-thread.entity';
import { ForumReply } from './entities/forum-reply.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(ForumThread) private threadRepo: Repository<ForumThread>,
    @InjectRepository(ForumReply) private replyRepo: Repository<ForumReply>,
  ) { }

  // Obtener threads de un curso específico
  async getThreadsByCourse(courseId: string) {
    return this.threadRepo.find({
      where: { courseId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    })
  }

  // Obtener un thread específico con sus replies
  async getThread(id: string
  ) {
    const thread = await this.threadRepo.findOne({
      where: { id },
      relations: ['author', 'replies', 'replies.author'],
    });
    if (!thread) throw new NotFoundException('Thread no encontrado');
    return thread;
  }

  // Crear thread, protegido por la estrategia de access token
  async createThread(dto: CreateThreadDto, authorId: number
  ) {
    const threadData: DeepPartial<ForumThread> = {
      title: dto.title,
      body: dto.body,
      courseId: dto.courseId.toString(),
      authorId: authorId,
    };

    const thread = this.threadRepo.create(threadData);
    return this.threadRepo.save(thread);
  }

  // Responder a un thread, protegido por la estrategia de access token
  async createReply(threadId: string
    , dto: CreateReplyDto, authorId: number
  ) {
    const thread = await this.threadRepo.findOne({
      where: { id: threadId.toString() },
    });

    if (!thread) throw new NotFoundException('Thread no encontrado');

    const replyData: DeepPartial<ForumReply> = {
      body: dto.body,
      threadId: threadId.toString(),
      authorId: authorId,
    };

    const reply = this.replyRepo.create(replyData);
    return this.replyRepo.save(reply);
  }
}
