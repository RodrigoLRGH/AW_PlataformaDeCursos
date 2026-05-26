import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Exam } from './entities/exam.entity';
import { ExamQuestion } from './entities/exam-question.entity';
import { ExamResult } from './entities/exam-result.entity';
import { Course } from '../courses/entities/course.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepo: Repository<Exam>,
    @InjectRepository(ExamQuestion)
    private readonly questionRepo: Repository<ExamQuestion>,
    @InjectRepository(ExamResult)
    private readonly resultRepo: Repository<ExamResult>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async create(courseId: number, dto: CreateExamDto, userId: number) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Curso no encontrado');

    if (Number(course.creatorId) !== Number(userId))
      throw new ForbiddenException('No autorizado para crear exámenes');

    const exam = this.examRepo.create({
      title: dto.title,
      courseId,
      passingScore: dto.passingScore ?? 70,
      timeLimitMinutes: dto.timeLimitMinutes,
    });

    const savedExam = await this.examRepo.save(exam);

    if (dto.questions && dto.questions.length > 0) {
      const questions = dto.questions.map((q, index) =>
        this.questionRepo.create({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          order: q.order ?? index + 1,
          points: q.points ?? 1,
          examId: savedExam.id,
        }),
      );
      await this.questionRepo.save(questions);
    }

    return this.findOne(savedExam.id);
  }

  async findOne(id: string) {
    const exam = await this.examRepo.findOne({
      where: { id },
      relations: ['questions'],
    });
    if (!exam) throw new NotFoundException('Examen no encontrado');
    return exam;
  }

  async getQuestionsForStudent(examId: string, userId: number) {
    const exam = await this.examRepo.findOne({
      where: { id: examId },
      relations: ['course'],
    });
    if (!exam) throw new NotFoundException('Examen no encontrado');

    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, courseId: exam.courseId },
    });
    if (!enrollment)
      throw new ForbiddenException('No estás inscrito en este curso');
    if (!enrollment.completedAt)
      throw new ForbiddenException(
        'Debes completar todas las lecciones antes de realizar el examen',
      );

    const questions = await this.questionRepo.find({
      where: { examId },
      order: { order: 'ASC' },
    });
    return questions.map(({ correctAnswer, ...q }) => q);
  }

  async submit(examId: string, userId: number, dto: SubmitExamDto) {
    const exam = await this.examRepo.findOne({
      where: { id: examId },
      relations: ['questions', 'course'],
    });
    if (!exam) throw new NotFoundException('Examen no encontrado');

    const enrollment = await this.enrollmentRepo.findOne({
      where: { userId, courseId: exam.courseId },
    });
    if (!enrollment)
      throw new ForbiddenException('No estás inscrito en este curso');
    if (!enrollment.completedAt)
      throw new ForbiddenException(
        'Debes completar todas las lecciones antes de realizar el examen',
      );

    const answersMap: Record<string, number> = {};
    for (const answer of dto.answers) {
      answersMap[answer.questionId] = answer.selectedOption;
    }

    let correct = 0;
    const total = exam.questions.length;
    for (const question of exam.questions) {
      const studentAnswer = answersMap[question.id];
      if (studentAnswer === question.correctAnswer) {
        correct++;
      }
    }

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    const result = this.resultRepo.create({
      userId,
      examId,
      score,
      isPassed: score >= exam.passingScore,
      totalQuestions: total,
      correctAnswers: correct,
    });
    return this.resultRepo.save(result);
  }

  async getMyResults(userId: number, examId: string) {
    return this.resultRepo.find({
      where: { userId, examId },
      order: { submittedAt: 'DESC' },
    });
  }

  async findByCourse(courseId: number) {
    return this.examRepo.findOne({
      where: { courseId },
    });
  }

  async getExamForCreator(examId: string, userId: number) {
    const exam = await this.examRepo.findOne({
      where: { id: examId },
      relations: ['questions', 'course'],
    });
    if (!exam) throw new NotFoundException('Examen no encontrado');

    if (Number(exam.course.creatorId) !== Number(userId)) {
      throw new ForbiddenException('No autorizado para ver este examen');
    }
    return exam;
  }

  async updateExam(examId: string, userId: number, dto: UpdateExamDto) {
    const exam = await this.examRepo.findOne({
      where: { id: examId },
      relations: ['course'],
    });
    if (!exam) throw new NotFoundException('Examen no encontrado');
    if (Number(exam.course.creatorId) !== Number(userId)) {
      throw new ForbiddenException('No autorizado para modificar este examen');
    }

    if (dto.title !== undefined) exam.title = dto.title;
    if (dto.passingScore !== undefined) exam.passingScore = dto.passingScore;
    if (dto.timeLimitMinutes !== undefined)
      exam.timeLimitMinutes = dto.timeLimitMinutes;
    await this.examRepo.save(exam);

    if (dto.questions !== undefined) {
      await this.questionRepo.delete({ examId: exam.id });

      if (dto.questions.length > 0) {
        const newQuestions = dto.questions.map((q, index) =>
          this.questionRepo.create({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: q.order ?? index + 1,
            points: q.points ?? 1,
            examId: exam.id,
          }),
        );
        await this.questionRepo.save(newQuestions);
      }
    }

    return this.findOne(exam.id);
  }

  async deleteExam(examId: string, userId: number) {
    const exam = await this.examRepo.findOne({
      where: { id: examId },
      relations: ['course'],
    });
    if (!exam) throw new NotFoundException('Examen no encontrado');
    if (Number(exam.course.creatorId) !== Number(userId)) {
      throw new ForbiddenException('No autorizado');
    }
    await this.examRepo.remove(exam);
    return { message: 'Examen eliminado' };
  }

  async findByCreator(userId: number) {
    return this.examRepo
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.course', 'course')
      .where('course.creatorId = :userId', { userId })
      .getMany();
  }
}
