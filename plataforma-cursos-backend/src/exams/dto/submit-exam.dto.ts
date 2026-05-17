import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

class AnswerDto {
  @IsString()
  questionId: string

  @IsInt()
  @Min(0)
  selectedOption: number
}

export class SubmitExamDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[]
}