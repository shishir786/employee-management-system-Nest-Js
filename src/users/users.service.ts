import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { Role } from 'src/utility/common/user.role.enum';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignInDTO } from './dto/user-signin.dto';
import { UserSignUpDTO } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  // constructor(
  //   @InjectRepository(UserEntity)
  //   private usersRepository: Repository<UserEntity>,
  // ) {}

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private authService: AuthService, // inject auth service
    private jwtService: JwtService,
  ) {}

  async signup(
    userSignUp: UserSignUpDTO,
  ): Promise<Omit<UserEntity, 'password'>> {
    const existingUser = await this.fundUserByEmail(userSignUp.email);
    if (existingUser) throw new BadRequestException('User already exists');

    userSignUp.password = await hash(userSignUp.password, 10);

    // Convert string[] to Role[] if role is provided
    let role: Role[] = [Role.USER];
    if (userSignUp.role && userSignUp.role.length > 0) {
      role = userSignUp.role.map((r) => r.toLowerCase() as Role);
    }

    let user = this.usersRepository.create({
      ...userSignUp,
      role,
    });
    user = await this.usersRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // async signin(userSignIn: UserSignInDTO): Promise<Omit<UserEntity, 'password'>> {
  //   const existUser = await this.usersRepository.createQueryBuilder('users').addSelect('users.password').where('users.email = :email', { email: userSignIn.email }).getOne();

  //   if (!existUser) throw new BadRequestException('User not found');
  //   const PasswordMatched = await compare(userSignIn.password, existUser.password);
  //   if (!PasswordMatched) throw new BadRequestException('Invalid password');
  //   const { password, ...userWithoutPassword } = existUser;
  //   return userWithoutPassword;
  // }

  async signin(
    userSignIn: UserSignInDTO,
  ): Promise<{ user: Omit<UserEntity, 'password'>; accessToken: string }> {
    const existUser = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email = :email', { email: userSignIn.email })
      .getOne();

    if (!existUser) throw new BadRequestException('User not found');

    const isMatched = await compare(userSignIn.password, existUser.password);
    if (!isMatched) throw new BadRequestException('Invalid password');

    const { password, ...userWithoutPassword } = existUser;
    const token = this.authService.generateToken(userWithoutPassword);

    return { user: userWithoutPassword, ...token };
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  // for finfing all users
  async findAll() {
    return await this.usersRepository.find();
  }

  // for finding a user by id
  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<UserEntity, 'password'>> {
    // console.log('UpdateUserDto received:', updateUserDto);
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // console.log('User before update:', user);
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    // console.log('User after update:', updatedUser);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async fundUserByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await hash(changePasswordDto.newPassword, 10);
    user.password = hashedNewPassword;
    await this.usersRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async updateUserRole(
    id: number,
    updateUserRoleDto: {
      role: import('../utility/common/user.role.enum').Role[];
    },
  ) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.role = updateUserRoleDto.role;
    return this.usersRepository.save(user);
  }
}
