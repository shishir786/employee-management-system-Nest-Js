import {
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
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { NoticeService } from './notice.service';

@Controller('notice')
@UseGuards(AuthGuard, AuthrizeGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  findAll() {
    return this.noticeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noticeService.findOne(+id);
  }

  @Post()
  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  create(@Body() createNoticeDto: CreateNoticeDto, @CurrentUser() currentUser) {
    return this.noticeService.create(createNoticeDto, currentUser);
  }

  @Patch(':id')
  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticeService.update(+id, updateNoticeDto);
  }

  @Delete(':id')
  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.noticeService.remove(+id);
  }
}
