import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumThread } from './entities/forum-thread.entity';
import { ForumReply } from './entities/forum-reply.entity';
import { ForumsService } from './forums.service';
import { ForumsController } from './forums.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ForumThread, ForumReply])],
  providers: [ForumsService],
  controllers: [ForumsController],
})
export class ForumsModule {}
