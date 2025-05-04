import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignUpDTO } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';
import { UserSignInDTO } from './dto/user-signin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { CurrerntUser } from 'src/utility/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(
    @Body() userSignUp: UserSignUpDTO,
  ): Promise<Omit<UserEntity, 'password'>> {
    return await this.usersService.signup(userSignUp);
  }

  @Post('signin')
  async signin(@Body() userSignIn: UserSignInDTO) {
    return await this.usersService.signin(userSignIn);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // return this.usersService.create(createUserDto);
    return 'hello';
  }

  //for finding all users
  @Get('all')
  async findAll() {
    return await this.usersService.findAll();
  }

  //for finding user by id
  // @Get(':id')
  // async findOne(@Param('id') id: string ) {
  //   const numericId = parseInt(id, 10);
  // if (isNaN(numericId)) {
  //   throw new BadRequestException('Invalid ID parameter');
  // }
  //   return await this.usersService.findOne(+id);
  // }

  // @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.usersService.findOne(id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user; // user from JWT payload
  // }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@CurrerntUser() currentUser: UserEntity) {
    return currentUser; 
  }

// Dynamic routes go last
// for finding user by id
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOne(id);
}



  
}
