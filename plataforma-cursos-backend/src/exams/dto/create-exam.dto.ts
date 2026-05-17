import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsInt, Min, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string

  @IsArray()
  @IsString({ each: true })
  options: string[]

  @IsInt()
  @Min(0)
  correctAnswer: number

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number

  @IsInt()
  @Min(1)
  @IsOptional()
  points?: number
}

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsNumber()
  @IsOptional()
  passingScore?: number

  @IsInt()
  @IsOptional()
  timeLimitMinutes?: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[]
}