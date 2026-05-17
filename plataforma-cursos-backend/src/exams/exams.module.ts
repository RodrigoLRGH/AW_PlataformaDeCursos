import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { ExamQuestion } from './entities/exam-question.entity';
import { ExamResult } from './entities/exam-result.entity';
import { Course } from '../courses/entities/course.entity';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, ExamQuestion, ExamResult, Course])],
  providers: [ExamsService],
  controllers: [ExamsController],
})
export class ExamsModule {}
