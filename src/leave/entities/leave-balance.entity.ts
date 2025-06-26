import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LeaveType } from '../enums/leave-type.enum';

@Entity()
export class LeaveBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: LeaveType })
  leaveType: LeaveType;

  @Column('float')
  balance: number;
}
