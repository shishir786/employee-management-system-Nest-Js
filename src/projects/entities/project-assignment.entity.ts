import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { Project } from './project.entity';

export enum AssignmentStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

@Entity('project_assignments')
@Unique(['project', 'user'])
export class ProjectAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, { eager: true, onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.PENDING,
  })
  status: AssignmentStatus;
}
