import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { ProjectAssignment } from './entities/project-assignment.entity';
import { Project } from './entities/project.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, UserEntity, ProjectAssignment])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
