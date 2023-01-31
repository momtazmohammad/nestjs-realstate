import { Controller, Post,Body, Param, ParseEnumPipe, Get, Res, UseInterceptors } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { UserType } from '@prisma/client';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import * as bcrypt from "bcryptjs"
import { User } from '../decorators/user.decorator';
import { Response } from 'express';
//import { UserInterceptor } from '../interceptors/user.interceptor';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}
    
    @Post('/signup/:userType')
    async singup(
        @Body() body:SignupDto,
        @Param("userType",new ParseEnumPipe(UserType)) userType:UserType,
        @Res({passthrough:true}) res:Response
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
        return this.authService.signup(body,userType,res);
    }
    @Post('/signin')
    signin(
        @Body() body:SigninDto,
        @Res({passthrough:true}) res:Response
    ){        
        return this.authService.signin(body,res)
    }
    @Post('/key')
    generateProductKey(@Body() {email,userType}:GenerateProductKeyDto){
        return this.authService.generateProductKey(email,userType)
    }
    @Post('logout')
       logout(
        @Res({passthrough:true}) res:Response
    ){
        res.clearCookie("jwt")
        return {message:"Success"}
    }
    //@UseInterceptors(UserInterceptor)
    @Get("/me")
    me(@User() user)
    {
        return user
    }

}
