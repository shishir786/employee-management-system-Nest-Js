import { Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  create(createDepartmentDto: CreateDepartmentDto) {
    // TODO: Implement create logic
    return 'This action adds a new department';
  }

  findAll() {
    // TODO: Implement find all logic
    return 'This action returns all departments';
  }

  findOne(id: number) {
    // TODO: Implement find one logic
    return `This action returns a #${id} department`;
  }

  update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    // TODO: Implement update logic
    return `This action updates a #${id} department`;
  }

  remove(id: number) {
    // TODO: Implement remove logic
    return `This action removes a #${id} department`;
  }
}
