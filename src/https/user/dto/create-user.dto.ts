import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
  IsStrongPassword,
  IsUrl,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateIf,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;
}
