import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { CourseStatus } from '../entities/course.entity'; 

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;
}
