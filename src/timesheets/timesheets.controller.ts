import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res, Request } from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';
import { Role } from 'src/utility/common/user.role.enum';

@Controller('timesheets')
@UseGuards(AuthGuard, RolesGuard)
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Post('create')
  @Roles(Role.USER, Role.ADMIN)
  create(@Body() createTimesheetDto: CreateTimesheetDto, @Request() req) {
    return this.timesheetsService.create(createTimesheetDto, req.user.id);
  }

  @Get('all')
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.timesheetsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.USER)
  findOne(@Param('id') id: string, @Request() req) {
    return this.timesheetsService.findOne(+id, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() updateTimesheetDto: UpdateTimesheetDto, @Request() req) {
    return this.timesheetsService.update(+id, updateTimesheetDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.timesheetsService.remove(+id, req.user);
  }

  @Get('export/excel')
  @Roles(Role.ADMIN, Role.MANAGER)
  async exportToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const buffer = await this.timesheetsService.exportToExcel(start, end);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=timesheets.xlsx',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
