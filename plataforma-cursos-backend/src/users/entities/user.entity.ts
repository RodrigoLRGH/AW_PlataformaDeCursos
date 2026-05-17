import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index, } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Course } from '../../courses/entities/course.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Progress } from '../../progress/entities/progress.entity';
import { ExamResult } from '../../exams/entities/exam-result.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';
import { ForumThread } from '../../forums/entities/forum-thread.entity';
import { ForumReply } from '../../forums/entities/forum-reply.entity';

export enum UserRole {
  STUDENT = 'student',
  CREATOR = 'creator',
}

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName: string;

  @Expose()
  get name(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Course, (course) => course.creator)
  courses: Course[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.user)
  enrollments: Enrollment[];

  @OneToMany(() => Progress, (progress) => progress.user)
  progressRecords: Progress[];

  @OneToMany(() => ExamResult, (result) => result.user)
  examResults: ExamResult[];

  @OneToMany(() => Certificate, (cert) => cert.user)
  certificates: Certificate[];

  @OneToMany(() => ForumThread, (thread) => thread.author)
  forumThreads: ForumThread[];

  @OneToMany(() => ForumReply, (reply) => reply.author)
  forumReplies: ForumReply[];
}
