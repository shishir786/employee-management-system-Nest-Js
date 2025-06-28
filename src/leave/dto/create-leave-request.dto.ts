import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeaveType } from '../enums/leave-type.enum';

export class CreateLeaveRequestDto {
  @IsNotEmpty()
  @IsEnum(LeaveType)
  type: LeaveType;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
