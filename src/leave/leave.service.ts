import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApproveLeaveRequestDto } from './dto/approve-leave-request.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveStatus } from './enums/leave-status.enum';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  async findAll(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find();
  }

  async findOne(id: number): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOneBy({ id });
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }
    return leaveRequest;
  }

  async approve(
    id: number,
    approveLeaveRequestDto: ApproveLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOneBy({ id });
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(
        'Only pending requests can be approved or rejected',
      );
    }
    leaveRequest.status = approveLeaveRequestDto.status;
    // Optionally: update leave balance if approved
    return this.leaveRequestRepository.save(leaveRequest);
  }

  async remove(id: number): Promise<void> {
    await this.leaveRequestRepository.delete(id);
  }

  async createForUser(
    userId: number,
    userName: string,
    dto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const leaveRequest = this.leaveRequestRepository.create({
      ...dto,
      userId,
      name: userName,
      status: LeaveStatus.PENDING,
    });
    return this.leaveRequestRepository.save(leaveRequest);
  }

  async findAllForUser(userId: number): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({ where: { userId } });
  }

  async findOneForUser(id: number, currentUser: any): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOneBy({ id });
    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }
    // Allow admin/manager to see any request
    if (
      currentUser.role?.includes('admin') ||
      currentUser.role?.includes('manager')
    ) {
      return leaveRequest;
    }
    // Regular users can only see their own requests
    if (leaveRequest.userId !== currentUser.id) {
      throw new ForbiddenException('You can only view your own leave requests');
    }
    return leaveRequest;
  }
}
