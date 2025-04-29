import {
  IsEmail,
  IsNotEmpty,
  isNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserSignInDTO } from './user-signin.dto';

export class UserSignUpDTO extends UserSignInDTO {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

}
