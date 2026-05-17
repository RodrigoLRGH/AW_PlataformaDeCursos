import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Certificates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(private certsService: CertificatesService) {}

  @Post('courses/:courseId')
  @ApiOperation({ summary: 'Generar certificado al completar un curso' })
  generate(@Param('courseId', ParseIntPipe) courseId: number, @Request() req) {
    return this.certsService.generate(req.user.id, courseId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Mis certificados' })
  getMy(@Request() req) {
    return this.certsService.getMyCertificates(req.user.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar certificado en PDF' })
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Res() res: Response,
  ) {
    const buffer = await this.certsService.downloadPdf(id, req.user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${id}.pdf"`,
    });
    res.end(buffer);
  }
}
