import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveStatus } from '../enums/leave-status.enum';

export class ApproveLeaveRequestDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
