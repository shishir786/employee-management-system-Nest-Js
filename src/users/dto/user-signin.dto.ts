import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserSignInDTO {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(3, {
    message: 'Password is too short. Minimum length is 3 characters',
  })
  password: string;
}
