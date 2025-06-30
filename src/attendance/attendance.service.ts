import { Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';


@Injectable()
export class AttendanceService {
  create(createAttendanceDto: CreateAttendanceDto) {
    return 'This action adds a new attendance record';
  }

  findAll() {
    return `This action returns all attendance records`;
  }

  findOne(id: number) {
    return `This action returns an attendance record with id ${id}`;
  }

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return `This action updates an attendance record with id ${id}`;
  }

  remove(id: number) {
    return `This action removes an attendance record with id ${id}`;
  }
}
