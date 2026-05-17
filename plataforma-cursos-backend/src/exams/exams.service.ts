import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Exam } from './entities/exam.entity';
import { ExamQuestion } from './entities/exam-question.entity';
import { ExamResult } from './entities/exam-result.entity';
import { Course } from '../courses/entities/course.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';

// Servicio de examenes
// Gestiona la creacion, consulta y envio de resultados de examenes por curso
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
  ) { }

  // Crear un examen con sus preguntas para un curso
  // Solo el creador del curso puede crear examenes
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
      const questions = dto.questions.map((q, index) => this.questionRepo.create({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        order: q.order ?? index + 1,
        points: q.points ?? 1,
        examId: savedExam.id,
      })
      );
      await this.questionRepo.save(questions);
    }

    return this.findOne(savedExam.id);
  }

  // Devuelve un examen por ID con sus preguntas
  // Lanza NotFoundException si el examen no existe
  async findOne(id: string) {
    const exam = await this.examRepo.findOne({
      where: { id },
      relations: ['questions'],
    });
    if (!exam) throw new NotFoundException('Examen no encontrado');
    return exam;
  }

  // Devuelve las preguntas de un examen sin exponer las respuestas correctas
  async getQuestionsForStudent(examId: string) {
    const questions = await this.questionRepo.find({
      where: { examId },
      order: { order: 'ASC' },
    });
    return questions.map(({ correctAnswer, ...q }) => q);
  }

  // Procesa las respuestas de un estudiante y guarda el resultado
  // Calcula el puntaje comparadno contra las respuestas correctas
  async submit(examId: string, userId: number, dto: SubmitExamDto) {
    const exam = await this.examRepo.findOne({
      where: { id: examId },
      relations: ['questions'],
    });
    if (!exam) throw new NotFoundException('Examen no encontrado');

    const answersMap: Record<string, number> = {}
    for (const answer of dto.answers) {
      answersMap[answer.questionId] = answer.selectedOption
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

  // Devuelve los resultados de un usuario para un examen, ordenados por fecha descendente
  async getMyResults(userId: number, examId: string) {
    return this.resultRepo.find({
      where: { userId, examId },
      order: { submittedAt: 'DESC' },
    });
  }

  // Devuelve el examen de un curso, si existe

  async findByCourse(courseId: number) {
    return this.examRepo.findOne({
      where: { courseId },
    });
  }
}
