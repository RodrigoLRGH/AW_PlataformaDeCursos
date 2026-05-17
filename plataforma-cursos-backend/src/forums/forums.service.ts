import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm'; // Importamos DeepPartial
import { ForumThread } from './entities/forum-thread.entity';
import { ForumReply } from './entities/forum-reply.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(ForumThread) private threadRepo: Repository<ForumThread>,
    @InjectRepository(ForumReply) private replyRepo: Repository<ForumReply>,
  ) {}

  async getThreadsByCourse(courseId: number) {
    return this.threadRepo.find({
      // Convertimos a string porque la entidad espera string
      where: { courseId: courseId.toString() as any },
      relations: ['author'],
      select: {
        author: {
          id: true as any,
          name: true as any,
        },
      },
      order: { createdAt: 'DESC' } as any,
    });
  }

  async getThread(id: number) {
    const thread = await this.threadRepo.findOne({
      where: { id: id.toString() },
      relations: ['author', 'replies', 'replies.author'],
    });
    if (!thread) throw new NotFoundException('Thread no encontrado');
    return thread;
  }

  async createThread(dto: CreateThreadDto, authorId: number) {
    // CORRECCIÓN CLAVE: Mapeamos manualmente para asegurar que los tipos coincidan
    // 'courseId' y 'authorId' deben ser strings según tu error TS
    const threadData: DeepPartial<ForumThread> = {
      title: dto.title,
      body: dto.body,
      courseId: dto.courseId.toString(), // Convertir a string
      authorId: authorId.toString(), // Convertir a string
    };

    const thread = this.threadRepo.create(threadData);
    return this.threadRepo.save(thread);
  }

  async createReply(threadId: number, dto: CreateReplyDto, authorId: number) {
    const thread = await this.threadRepo.findOne({
      where: { id: threadId.toString() },
    });

    if (!thread) throw new NotFoundException('Thread no encontrado');

    // Cambiamos 'content' por 'body' (o el nombre real en tu entidad/DTO)
    const replyData: DeepPartial<ForumReply> = {
      body: (dto as any).body || (dto as any).content, // Ajuste defensivo
      threadId: threadId.toString(),
      authorId: authorId.toString(),
    };

    const reply = this.replyRepo.create(replyData);
    return this.replyRepo.save(reply);
  }
}
