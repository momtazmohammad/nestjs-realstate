import { UserType } from "@prisma/client";
import { IsString ,IsEmail, IsNotEmpty,MinLength,Matches, IsEnum, IsOptional} from "class-validator";

export class SignupDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    //@Matches(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,{message:"phone format is not correct"})
    @IsString()
    phone: string;
    @IsEmail()
    email: string;
    @IsString()
    @MinLength(5)
    password: string;
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    productKey?:string
}

export class SigninDto {    
    @IsEmail()
    email: string;
    @IsString()
    password: string;
}
export class GenerateProductKeyDto {
    @IsEmail()
    email: string;
    @IsEnum(UserType)
    userType: UserType
}