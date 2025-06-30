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
import { AuthGuard } from '../auth/jwt-auth.guard';
import { AuthrizeGuard } from '../auth/jwt-authrize.guard';
import { UserEntity } from '../users/entities/user.entity';
import { AuthorizeRoles } from '../utility/common/decorators/authorize-roles.decorator';
import { CurrentUser } from '../utility/common/decorators/current-user.decorator';
import { Role } from '../utility/common/user.role.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @AuthorizeRoles(Role.MANAGER)
  @UseGuards(AuthGuard, AuthrizeGuard)
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.projectsService.create(createProjectDto, user);
  }

  @Get()
  @UseGuards(AuthGuard, AuthrizeGuard)
  findAll(@CurrentUser() currentUser: UserEntity) {
    if (
      currentUser.role.includes(Role.MANAGER) ||
      currentUser.role.includes(Role.ADMIN)
    ) {
      return this.projectsService.findAll();
    } else {
      return this.projectsService.findByAssignedEmployee(currentUser.id);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard, AuthrizeGuard)
  findOne(@Param('id') id: string, @CurrentUser() currentUser: UserEntity) {
    return this.projectsService.findOneForUser(+id, currentUser, true);
  }

  @Patch(':id')
  @AuthorizeRoles(Role.MANAGER)
  @UseGuards(AuthGuard, AuthrizeGuard)
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @AuthorizeRoles(Role.MANAGER)
  @UseGuards(AuthGuard, AuthrizeGuard)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }

  @Post(':id/respond')
  @UseGuards(AuthGuard, AuthrizeGuard)
  respondToAssignment(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Body('action') action: 'accept' | 'reject',
  ) {
    if (action === 'accept') {
      return this.projectsService.acceptAssignment(+id, user.id);
    } else if (action === 'reject') {
      return this.projectsService.rejectAssignment(+id, user.id);
    } else {
      throw new BadRequestException('Invalid action');
    }
  }
}
