import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { Role } from 'src/utility/common/user.role.enum';

export class UpdateUserRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  role: Role[];
}
