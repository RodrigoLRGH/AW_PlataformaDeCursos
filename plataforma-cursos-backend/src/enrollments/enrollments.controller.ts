import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Enrollments')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Inscribirse en un curso' })
  @ApiResponse({ status: 201, description: 'Inscripción exitosa' })
  @ApiResponse({ status: 409, description: 'Ya estás inscrito en este curso' })
  enroll(@Body() dto: CreateEnrollmentDto, @Request() req) {
    return this.enrollmentsService.enroll(req.user.sub, dto.courseId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Mis inscripciones' })
  findMy(@Request() req) {
    return this.enrollmentsService.findMyEnrollments(req.user.sub);
  }

  @Get('check/:courseId')
  @ApiOperation({ summary: 'Verificar si estoy inscrito en un curso' })
  checkEnrollment(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Request() req,
  ) {
    return this.enrollmentsService.isEnrolled(req.user.sub, courseId);
  }
}
