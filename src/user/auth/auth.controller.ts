import { Controller, Post,Body, Param, ParseEnumPipe, Get } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { UserType } from '@prisma/client';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import * as bcrypt from "bcryptjs"
import { User } from '../decorators/user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}
    
    @Post('/signup/:userType')
    async singup(
        @Body() body:SignupDto,
        @Param("userType",new ParseEnumPipe(UserType)) userType:UserType
        ){
            if(userType!=="BUYER"){
                if(!body.productKey){
                    throw new UnauthorizedException()
                }
                const correctProductKey=await bcrypt.compare(`${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`,body.productKey);
                if(!correctProductKey){
                    throw new UnauthorizedException()
                }
            }
        return this.authService.signup(body,userType);
    }
    @Post('/signin')
    signin(
        @Body() body:SigninDto
    ){        
        return this.authService.signin(body)
    }
    @Post('/key')
    generateProductKey(@Body() {email,userType}:GenerateProductKeyDto){
        return this.authService.generateProductKey(email,userType)
    }
    @Get("/me")
    me(@User() user)
    {
        return user
    }

}
