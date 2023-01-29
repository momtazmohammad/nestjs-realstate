import { ConflictException,HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import { UserType } from '@prisma/client';
import { Response } from 'express';

interface SignupParams{
    name:string;
    email:string;
    phone:string;
    password:string;
}

interface SigninParams{
    email:string;
    password:string;
}

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService){}
    async signup({email,password,name,phone}:SignupParams,userType:UserType,res){
        const userExists=await this.prismaService.user.findUnique({
            where: {
                email
            }
        })
        if(userExists){
            throw new ConflictException()
        }
        const hashedPassword=await bcrypt.hash(password,10)
        const user=await this.prismaService.user.create({
            data:{email,name,phone,password:hashedPassword,
            user_type:userType}
        })
        return this.generateJwt(name,user.id,email,res)  

    }
    async signin({email,password}:SigninParams,res:Response){
        const user=await this.prismaService.user.findUnique({
            where: {
                email
            }
        })
        if(!user){
            throw new HttpException("invalid credentials",400)
        }
        const correctPassword=await bcrypt.compare(password,user.password);
        if(!correctPassword) {
            throw new HttpException("invalid credentials",400)
        }
        return this.generateJwt(user.name,user.id,email,res)        
    }

    private generateJwt(name:string,id:number,email:string,res:Response) {
        const token=jwt.sign({
            name,
            id,
            email
        },process.env.JSON_SECRET_KEY,{expiresIn:24*60*60});
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production" ? true : false,
            maxAge: 24 * 60 * 60 * 1000,
          }); //secure: true
          return token
    }
    generateProductKey(email:string,userType:UserType){
        return bcrypt.hash(`${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`,10)
    }
}
