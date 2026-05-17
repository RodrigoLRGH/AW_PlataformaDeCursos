import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { randomUUID } from 'crypto';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate) private certRepo: Repository<Certificate>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  async generate(userId: number, courseId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      // Forzamos que los IDs sean tratados según el tipo de la entidad (number)
      where: { userId: Number(userId), courseId: Number(courseId) } as any,
      relations: ['course', 'user'],
    });

    if (!enrollment)
      throw new NotFoundException('No estás inscrito en este curso');

    // REPARACIÓN: Si usas completedAt en la entidad, cámbialo aquí
    // Si usas el booleano 'completed', asegúrate de que exista en la entidad Enrollment
    if (!enrollment.completedAt && !(enrollment as any).completed)
      throw new ForbiddenException(
        'Debes completar el curso antes de obtener el certificado',
      );

    const existing = await this.certRepo.findOne({
      where: { userId: Number(userId), courseId: Number(courseId) } as any,
    });

    if (existing) return existing;

    const cert = this.certRepo.create({
      userId: Number(userId),
      courseId: Number(courseId),
      certificateCode: randomUUID(),
    });

    return this.certRepo.save(cert);
  }

  async getMyCertificates(userId: number) {
    return this.certRepo.find({
      where: { userId: Number(userId) } as any,
      relations: ['course'],
    });
  }

  async downloadPdf(certId: number, userId: number): Promise<Buffer> {
    const cert = await this.certRepo.findOne({
      where: { id: Number(certId) } as any,
      relations: ['user', 'course'],
    });

    if (!cert) throw new NotFoundException('Certificado no encontrado');

    // REPARACIÓN: Comparación segura de tipos
    if (Number(cert.userId) !== Number(userId)) {
      throw new ForbiddenException('No autorizado');
    }

    return new Promise((resolve, reject) => {
      // PDFKit usa una estructura de flujo (stream)
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // --- Diseño del certificado ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f4e8');

      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .stroke('#8b7355');

      doc
        .fillColor('#2c1810')
        .fontSize(36)
        .font('Helvetica-Bold')
        .text('CERTIFICADO DE FINALIZACIÓN', 0, 100, { align: 'center' });

      doc
        .fontSize(16)
        .font('Helvetica')
        .fillColor('#2c1810')
        .text('Este certificado acredita que', 0, 180, { align: 'center' });

      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#1a472a')
        .text(cert.user?.name || 'Estudiante', 0, 220, { align: 'center' });

      doc
        .fontSize(16)
        .font('Helvetica')
        .fillColor('#2c1810')
        .text('ha completado exitosamente el curso', 0, 280, {
          align: 'center',
        });

      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(cert.course?.title || 'Curso', 0, 320, { align: 'center' });

      // REPARACIÓN: Uso de Template Strings para evitar errores de caracteres inválidos
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#2c1810')
        .text(`Código: ${cert.certificateCode || certId}`, 0, 390, {
          align: 'center',
        });

      doc.text(`Expedido el ${new Date().toLocaleDateString()}`, {
        align: 'center',
      });

      doc.end();
    });
  }
}
