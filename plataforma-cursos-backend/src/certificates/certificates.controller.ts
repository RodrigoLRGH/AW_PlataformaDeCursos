import { Controller, Post, Get, Param, ParseIntPipe, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@ApiTags('Certificates')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(private certsService: CertificatesService) { }

  // Generar certificado al completar un curso
  @Post('courses/:courseId')
  @ApiOperation({ summary: 'Generar certificado al completar un curso' })
  generate(@Param('courseId', ParseIntPipe) courseId: number, @Request() req) {
    return this.certsService.generate(req.user.sub, courseId);
  }

  // Obtener mis certificados
  @Get('my')
  @ApiOperation({ summary: 'Mis certificados' })
  getMy(@Request() req) {
    return this.certsService.getMyCertificates(req.user.sub);
  }

  // Descargar certificado en PDF
  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar certificado en PDF' })
  async download(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const buffer = await this.certsService.downloadPdf(id, req.user.sub)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${id}.pdf"`,
    })
    res.end(buffer)
  }
}
