import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthrizeGuard } from 'src/auth/jwt-authrize.guard';
import { AuthorizeRoles } from 'src/utility/common/decorators/authorize-roles.decorator';
import { CurrentUser } from 'src/utility/common/decorators/current-user.decorator';
import { Role } from 'src/utility/common/user.role.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignInDTO } from './dto/user-signin.dto';
import { UserSignUpDTO } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

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
  @AuthorizeRoles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard, AuthrizeGuard)
  @Get('all')
  async findAll() {
    return await this.usersService.findAll();
  }

  // update user
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // console.log('Raw body:', req.body);
    return this.usersService.update(+id, updateUserDto);
  }

  // update user role (admin only)
  @Patch(':id/role')
  @AuthorizeRoles(Role.ADMIN)
  @UseGuards(AuthGuard, AuthrizeGuard)
  async updateUserRole(
    @Param('id') id: string,
    @Body()
    updateUserRoleDto: import('./dto/update-user-role.dto').UpdateUserRoleDto,
  ) {
    return await this.usersService.updateUserRole(+id, updateUserRoleDto);
  }

  @Delete(':id')
  @AuthorizeRoles(Role.ADMIN)
  @UseGuards(AuthGuard, AuthrizeGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    // Check if admin is trying to delete their own account
    if (currentUser.id === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    return await this.usersService.remove(id);
  }

  //for getting profile
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() currentUser: UserEntity) {
    return currentUser;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  //for changing password
  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() currentUser: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    //console.log('Received request body:', changePasswordDto); // Add logging to debug
    return await this.usersService.changePassword(
      currentUser.id,
      changePasswordDto,
    );
  }
}
