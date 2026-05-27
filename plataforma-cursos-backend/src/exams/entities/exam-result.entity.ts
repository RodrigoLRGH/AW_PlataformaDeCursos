import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exam } from './exam.entity';
import { Certificate } from '../../certificates/entities/certificate.entity';

@Entity('exam_results')
@Index(['userId'])
@Index(['examId'])
@Unique(['userId', 'examId'])
export class ExamResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'exam_id' })
  examId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ name: 'is_passed' })
  isPassed: boolean;

  @Column({ name: 'total_questions', type: 'int' })
  totalQuestions: number;

  @Column({ name: 'correct_answers', type: 'int' })
  correctAnswers: number;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @ManyToOne(() => User, (user) => user.examResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Exam, (exam) => exam.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  certificate: Certificate;
}
