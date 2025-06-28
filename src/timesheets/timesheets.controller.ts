import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthrizeGuard } from 'src/auth/jwt-authrize.guard';
import { AuthorizeRoles } from 'src/utility/common/decorators/authorize-roles.decorator';
import { CurrentUser } from 'src/utility/common/decorators/current-user.decorator';
import { Role } from 'src/utility/common/user.role.enum';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import {
  UpdateTimesheetDto,
  UpdateTimesheetStatusDto,
} from './dto/update-timesheet.dto';
import { TimesheetsService } from './timesheets.service';

@Controller('timesheets')
@UseGuards(AuthGuard, AuthrizeGuard)
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  // Create a new timesheet
  @Post('create')
  @AuthorizeRoles(Role.USER, Role.ADMIN, Role.MANAGER)
  create(
    @CurrentUser() currentUser,
    @Body() createTimesheetDto: CreateTimesheetDto,
  ) {
    return this.timesheetsService.create(createTimesheetDto, currentUser.id);
  }

  // Get all timesheets
  @Get('all')
  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.timesheetsService.findAll();
  }

  // Get a single timesheet by ID
  @Get(':id')
  @AuthorizeRoles(Role.ADMIN, Role.MANAGER, Role.USER)
  findOne(@Param('id') id: string, @CurrentUser() currentUser) {
    return this.timesheetsService.findOne(+id, currentUser);
  }

  // Update a timesheet by ID
  @Patch(':id')
  @AuthorizeRoles(Role.USER, Role.ADMIN, Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateTimesheetDto: UpdateTimesheetDto,
    @CurrentUser() currentUser,
  ) {
    return this.timesheetsService.update(+id, updateTimesheetDto, currentUser);
  }

  // Update timesheet status
  @Patch(':id/status')
  @AuthorizeRoles(Role.USER, Role.ADMIN, Role.MANAGER)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTimesheetStatusDto,
    @CurrentUser() currentUser,
  ) {
    return this.timesheetsService.updateStatus(
      +id,
      updateStatusDto.status,
      currentUser,
    );
  }

  // Delete a timesheet by ID
  @Delete(':id')
  @AuthorizeRoles(Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() currentUser) {
    return this.timesheetsService.remove(+id, currentUser);
  }

  // Export timesheets to Excel
  @Get('export/excel')
  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  async exportToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const buffer = await this.timesheetsService.exportToExcel(start, end);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=timesheets.xlsx',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  // Get all timesheets for the current user
  @Get()
  @AuthorizeRoles(Role.USER, Role.ADMIN, Role.MANAGER)
  findMine(@CurrentUser() currentUser) {
    return this.timesheetsService.findMine(currentUser.id);
  }
}
