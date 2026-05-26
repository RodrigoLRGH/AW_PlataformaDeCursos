import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Exam } from '../../exams/entities/exam.entity';
import { ForumThread } from '../../forums/entities/forum-thread.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('courses')
@Index(['creatorId'])
@Index(['status'])
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ length: 50, nullable: true })
  level?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
    nullable: false,
  })
  price: number = 0;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status!: CourseStatus;

  @Column({ name: 'creator_id' })
  creatorId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.courses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creator_id' })
  creator!: User;

  @OneToMany(() => Lesson, (lesson: Lesson) => lesson.course, {
    cascade: ['insert', 'update'],
  })
  lessons!: Lesson[];

  @OneToMany(() => Enrollment, (enrollment: Enrollment) => enrollment.course)
  enrollments!: Enrollment[];

  @OneToMany(() => Exam, (exam: Exam) => exam.course)
  exams!: Exam[];

  @OneToMany(() => ForumThread, (thread: ForumThread) => thread.course)
  forumThreads!: ForumThread[];

  @OneToMany(() => Certificate, (certificate) => certificate.course, {
  cascade: true,
  })
  certificates!: Certificate[];
}
