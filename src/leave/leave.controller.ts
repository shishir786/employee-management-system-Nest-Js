import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ApproveLeaveRequestDto } from './dto/approve-leave-request.dto';
import { CurrentUser } from 'src/utility/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { AuthorizeRoles } from 'src/utility/common/decorators/authorize-roles.decorator';
import { Role } from 'src/utility/common/user.role.enum';

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
      createLeaveRequestDto,
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@CurrentUser() currentUser: UserEntity) {
    return this.leaveService.findAllForUser(currentUser.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.leaveService.findOneForUser(+id, currentUser);
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
