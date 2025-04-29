import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserSignUpDTO } from './dto/user-signup.dto';
import { hash,compare } from 'bcrypt';
import { UserSignInDTO } from './dto/user-signin.dto';
import { AuthService } from 'src/auth/auth.service';

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

  async signin(userSignIn: UserSignInDTO): Promise<{ user: Omit<UserEntity, 'password'>; accessToken: string }> {
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

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async fundUserByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }
}


