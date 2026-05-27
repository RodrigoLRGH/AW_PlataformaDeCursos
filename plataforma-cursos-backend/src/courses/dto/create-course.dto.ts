import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
  Max,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(75)
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ValidateIf((o) => o.thumbnailUrl !== undefined && o.thumbnailUrl !== '')
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(25)
  category?: string;

  @ApiProperty({
    enum: ['beginner', 'intermediate', 'advanced'],
    required: false,
  })
  @IsString()
  @IsOptional()
  level?: string;
}
