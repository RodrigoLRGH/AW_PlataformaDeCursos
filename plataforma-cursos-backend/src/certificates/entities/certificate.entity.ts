import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ExamResult } from '../../exams/entities/exam-result.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('certificates')
@Index(['userId'])
@Index(['courseId'])
@Index(['certificateCode'], { unique: true })
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // CAMBIO: Cambiar a 'number' si tus otros servicios envían números
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({ name: 'exam_result_id', unique: true })
  examResultId: number;

  @Column({ name: 'certificate_code', unique: true })
  certificateCode: string;

  @Column({ name: 'issued_at', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.certificates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => ExamResult, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'exam_result_id' })
  examResult: ExamResult;
}
