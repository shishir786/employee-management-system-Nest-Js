import { PartialType } from '@nestjs/mapped-types';
import { CreateTimesheetDto } from './create-timesheet.dto';
import { IsEnum, IsOptional, IsNumber } from 'class-validator';

export class UpdateTimesheetDto extends PartialType(CreateTimesheetDto) {
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @IsNumber()
  totalHours?: number;
}
