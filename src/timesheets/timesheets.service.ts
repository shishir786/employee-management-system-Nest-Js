import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { UsersService } from '../users/users.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { Timesheet } from './entities/timesheet.entity';

@Injectable()
export class TimesheetsService {
  constructor(
    @InjectRepository(Timesheet)
    private timesheetRepository: Repository<Timesheet>,
    private usersService: UsersService,
  ) {}

  async create(
    createTimesheetDto: CreateTimesheetDto,
    userId: number,
  ): Promise<Timesheet> {
    const employee = await this.usersService.findOne(userId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Ensure date is a valid Date object
    const date = new Date(createTimesheetDto.date);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    const timesheet = this.timesheetRepository.create({
      ...createTimesheetDto,
      date,
      employee,
      employeeName: employee.name,
      totalHours: this.calculateTotalHours(
        createTimesheetDto.startTime,
        createTimesheetDto.endTime,
      ),
    });

    return this.timesheetRepository.save(timesheet);
  }

  async findAll(): Promise<Timesheet[]> {
    return this.timesheetRepository.find({
      relations: ['employee'],
    });
  }

  async findOne(id: number, currentUser: any): Promise<Timesheet> {
    const timesheet = await this.timesheetRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!timesheet) {
      throw new NotFoundException('Timesheet not found');
    }

    // Check if user has permission to view this timesheet
    if (
      currentUser.roles.includes('admin') ||
      currentUser.roles.includes('manager')
    ) {
      return timesheet;
    }

    // Regular users can only view their own timesheets
    if (timesheet.employee.id !== currentUser.id) {
      throw new ForbiddenException('You can only view your own timesheets');
    }

    return timesheet;
  }

  async update(
    id: number,
    updateTimesheetDto: UpdateTimesheetDto,
    currentUser: any,
  ): Promise<Timesheet> {
    const timesheet = await this.findOne(id, currentUser);

    if (updateTimesheetDto.startTime && updateTimesheetDto.endTime) {
      updateTimesheetDto.totalHours = this.calculateTotalHours(
        updateTimesheetDto.startTime,
        updateTimesheetDto.endTime,
      );
    }

    if (updateTimesheetDto.date) {
      const date = new Date(updateTimesheetDto.date);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      updateTimesheetDto.date = date;
    }

    Object.assign(timesheet, updateTimesheetDto);
    return this.timesheetRepository.save(timesheet);
  }

  async remove(id: number, currentUser: any): Promise<void> {
    const timesheet = await this.findOne(id, currentUser);
    await this.timesheetRepository.remove(timesheet);
  }

  private calculateTotalHours(startTime: string, endTime: string): number {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return parseFloat(diffInHours.toFixed(2));
  }

  async exportToExcel(startDate?: Date, endDate?: Date): Promise<Buffer> {
    const queryBuilder = this.timesheetRepository
      .createQueryBuilder('timesheet')
      .leftJoinAndSelect('timesheet.employee', 'employee');

    if (startDate && endDate) {
      queryBuilder.where('timesheet.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const timesheets = await queryBuilder.getMany();

    const data = timesheets.map((timesheet) => ({
      'Employee Name': timesheet.employee.name,
      Date: new Date(timesheet.date).toISOString().split('T')[0],
      'Start Time': timesheet.startTime,
      'End Time': timesheet.endTime,
      'Total Hours': timesheet.totalHours,
      Description: timesheet.description,
      Status: timesheet.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheets');

    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });
    return excelBuffer;
  }

  async findMine(userId: number): Promise<Timesheet[]> {
    return this.timesheetRepository.find({
      where: { employee: { id: userId } },
      relations: ['employee'],
    });
  }
}
