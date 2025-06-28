import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CreateTimesheetDto } from './create-timesheet.dto';

export class UpdateTimesheetDto extends PartialType(CreateTimesheetDto) {
  @IsOptional()
  @IsEnum(['pending', 'completed'])
  status?: 'pending' | 'completed';

  @IsOptional()
  @IsNumber()
  totalHours?: number;
}

export class UpdateTimesheetStatusDto {
  @IsEnum(['pending', 'completed'])
  status: 'pending' | 'completed';
}
