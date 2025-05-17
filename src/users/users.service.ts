import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserSignUpDTO } from './dto/user-signup.dto';
import { hash, compare } from 'bcrypt';
import { UserSignInDTO } from './dto/user-signin.dto';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';

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

    let user = this.usersRepository.create(userSignUp);
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
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
}
