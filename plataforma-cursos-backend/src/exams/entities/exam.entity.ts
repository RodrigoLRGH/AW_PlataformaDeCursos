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
import { Course } from '../../courses/entities/course.entity';
import { ExamQuestion } from './exam-question.entity';
import { ExamResult } from './exam-result.entity';

@Entity('exams')
@Index(['courseId'])
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({
    name: 'passing_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 70.0,
  })
  passingScore: number;

  @Column({ name: 'time_limit_minutes', type: 'int', nullable: true })
  timeLimitMinutes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.exams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => ExamQuestion, (q) => q.exam, {
    cascade: ['insert', 'update'],
  })
  questions: ExamQuestion[];

  @OneToMany(() => ExamResult, (r) => r.exam)
  results: ExamResult[];
}
