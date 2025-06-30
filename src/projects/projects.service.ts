import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { Role } from '../utility/common/user.role.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  AssignmentStatus,
  ProjectAssignment,
} from './entities/project-assignment.entity';
import { Project, ProjectStatus } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProjectAssignment)
    private readonly assignmentRepository: Repository<ProjectAssignment>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    creator: UserEntity,
  ): Promise<Project> {
    const { assignedEmployees, ...rest } = createProjectDto;
    const project = this.projectRepository.create({ ...rest, creator });
    const savedProject = await this.projectRepository.save(project);
    if (assignedEmployees && assignedEmployees.length > 0) {
      const users = await this.userRepository.findByIds(assignedEmployees);
      for (const user of users) {
        const assignment = this.assignmentRepository.create({
          project: savedProject,
          user,
          status: AssignmentStatus.PENDING,
        });
        await this.assignmentRepository.save(assignment);
      }
    }
    return savedProject;
  }

  async findAll(): Promise<any[]> {
    const projects = await this.projectRepository.find({
      relations: ['creator'],
    });
    const result: any[] = [];
    for (const project of projects) {
      const assignments = await this.assignmentRepository.find({
        where: { project: { id: project.id } },
        relations: ['user'],
      });
      result.push({
        ...project,
        assignedUsers: assignments.map((a) => ({
          id: a.user.id,
          name: a.user.name,
          assignmentStatus: a.status,
        })),
      });
    }
    return result;
  }

  async findByAssignedEmployee(userId: number): Promise<any[]> {
    const assignments = await this.assignmentRepository.find({
      where: { user: { id: userId } },
      relations: ['project', 'user', 'project.creator'],
    });
    return assignments.map((a) => ({
      ...a.project,
      assignmentStatus: a.status,
      assignedUser: {
        id: a.user.id,
        name: a.user.name,
      },
      creator: a.project.creator
        ? { id: a.project.creator.id, name: a.project.creator.name }
        : null,
    }));
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findOneForUser(
    id: number,
    user: UserEntity,
    allowAdmin = false,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (
      user.role.includes(Role.MANAGER) ||
      (allowAdmin && user.role.includes(Role.ADMIN))
    ) {
      return project;
    }
    // Check if user has a ProjectAssignment for this project
    const assignment = await this.assignmentRepository.findOne({
      where: { project: { id }, user: { id: user.id } },
    });
    if (assignment) {
      return project;
    }
    throw new ForbiddenException('You do not have access to this project');
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    const { assignedEmployees, ...rest } = updateProjectDto;
    Object.assign(project, rest);
    return this.projectRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    await this.projectRepository.remove(project);
  }

  async acceptAssignment(
    projectId: number,
    userId: number,
  ): Promise<ProjectAssignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { project: { id: projectId }, user: { id: userId } },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    assignment.status = AssignmentStatus.ACCEPTED;
    await this.assignmentRepository.save(assignment);
    // Set project status to IN_PROGRESS on accept
    await this.projectRepository.update(projectId, {
      status: ProjectStatus.IN_PROGRESS,
    });
    return assignment;
  }

  async rejectAssignment(
    projectId: number,
    userId: number,
  ): Promise<ProjectAssignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { project: { id: projectId }, user: { id: userId } },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    assignment.status = AssignmentStatus.REJECTED;
    await this.assignmentRepository.save(assignment);
    // Set project status to NOT_INITIATED on reject
    await this.projectRepository.update(projectId, {
      status: ProjectStatus.NOT_INITIATED,
    });
    return assignment;
  }
}
