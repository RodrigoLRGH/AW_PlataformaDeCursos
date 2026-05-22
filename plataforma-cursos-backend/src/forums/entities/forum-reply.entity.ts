import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ForumThread } from './forum-thread.entity';

@Entity('forum_replies')
@Index(['threadId'])
@Index(['authorId'])
export class ForumReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'thread_id' })
  threadId: string;

  @Column({ name: 'author_id' })
  authorId: number;

  @Column({ name: 'is_accepted_answer', default: false })
  isAcceptedAnswer: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ForumThread, (thread) => thread.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'thread_id' })
  thread: ForumThread;

  @ManyToOne(() => User, (user) => user.forumReplies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
