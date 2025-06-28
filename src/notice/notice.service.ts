import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { Notice } from './entities/notice.entity';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
  ) {}

  create(
    createNoticeDto: CreateNoticeDto,
    currentUser: { id: number; name: string },
  ) {
    const notice = this.noticeRepository.create({
      ...createNoticeDto,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
    });
    return this.noticeRepository.save(notice);
  }

  findAll() {
    return this.noticeRepository.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.noticeRepository.findOneBy({ id });
  }

  async update(id: number, updateNoticeDto: UpdateNoticeDto) {
    const notice = await this.noticeRepository.findOneBy({ id });
    if (!notice) throw new NotFoundException('Notice not found');
    Object.assign(notice, updateNoticeDto);
    return this.noticeRepository.save(notice);
  }

  async remove(id: number) {
    const notice = await this.noticeRepository.findOneBy({ id });
    if (!notice) throw new NotFoundException('Notice not found');
    return this.noticeRepository.remove(notice);
  }
}
