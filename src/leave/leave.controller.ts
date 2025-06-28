import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthrizeGuard } from 'src/auth/jwt-authrize.guard';
import { AuthorizeRoles } from 'src/utility/common/decorators/authorize-roles.decorator';
import { CurrentUser } from 'src/utility/common/decorators/current-user.decorator';
import { Role } from 'src/utility/common/user.role.enum';
import { UserEntity } from '../users/entities/user.entity';
import { ApproveLeaveRequestDto } from './dto/approve-leave-request.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveService } from './leave.service';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @CurrentUser() currentUser: UserEntity,
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
  ) {
    return this.leaveService.createForUser(
      currentUser.id,
      currentUser.name,
      createLeaveRequestDto,
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@CurrentUser() currentUser: UserEntity) {
    if (!currentUser || !currentUser.id) {
      throw new BadRequestException('User not authenticated');
    }
    return this.leaveService.findAllForUser(currentUser.id);
  }

  @UseGuards(AuthGuard, AuthrizeGuard)
  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  @Get('all')
  findAllRequests() {
    return this.leaveService.findAll();
  }

  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid leave request ID');
    }
    return this.leaveService.findOneForUser(numericId, currentUser);
  }

  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard)
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() approveLeaveRequestDto: ApproveLeaveRequestDto,
  ) {
    return this.leaveService.approve(+id, approveLeaveRequestDto);
  }

  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.remove(+id);
  }
}
