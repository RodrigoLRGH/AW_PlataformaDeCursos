import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateQuestionDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsInt()
  @Min(0)
  correctAnswer: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  points?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdateExamDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @IsInt()
  @IsOptional()
  timeLimitMinutes?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  @IsOptional()
  questions?: UpdateQuestionDto[];
}
