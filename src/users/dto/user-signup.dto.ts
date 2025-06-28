import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserSignInDTO } from './user-signin.dto';

export class UserSignUpDTO extends UserSignInDTO {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsOptional()
  @IsArray()
  role?: string[];
}
