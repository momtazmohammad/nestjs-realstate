import { Controller, Get,UseGuards,Patch ,Param,Delete, Post, Put,Body,  Query} from '@nestjs/common';
import {  UnauthorizedException } from '@nestjs/common/exceptions';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { PropertyType, UserType } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { CreateHomeDto, HomeResponseDto, InquireDto, UpdateHomeDto } from './dtos/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService:HomeService){}
    @Get()
    getHomes(
        @Query("city") city?:string,
        @Query("minPrice") minPrice?:string,
        @Query("maxPrice") maxPrice?:string,
        @Query("propertyType") propertyType?:PropertyType
    ):Promise<HomeResponseDto[]> {        
        const price=minPrice || maxPrice ?{
            ...(minPrice && {gte:+minPrice}),
            ...(maxPrice && {lte:+maxPrice})
        }:undefined
        const filter={
            ...(city && {city}),
            ...(price && {price}),
            ...(propertyType && {property_type:propertyType})
        }
        return this.homeService.getHomes(filter)
    }
    
    @Get(":id")
    getHome(@Param("id") id:number){
        return this.homeService.getHome(id)
    }

    @Roles(UserType.REALTOR)
    @UseGuards(AuthGuard)
    @Post()
    createHome(
        @Body() body:CreateHomeDto,
        @User() user        
    ){
         return this.homeService.createHome(body,user.id)
    }

    @Roles(UserType.REALTOR)
    @UseGuards(AuthGuard)
    @Put(":id")
    async updateHome(
        @Param("id",ParseIntPipe) id:number,
        @Body() body:UpdateHomeDto,
        @User() user
    ){
        const realtor=await this.homeService.getRealtorByHomeId(id)
        if(realtor.id!==user.id){
            throw new UnauthorizedException()
        }
        return this.homeService.updateHome(id,body)
    }
    
    @Roles(UserType.REALTOR)
    @UseGuards(AuthGuard)
    @Delete(":id")
    async deleteHome(
        @Param("id",ParseIntPipe) id:number,        
        @User() user
    ){
        
        const realtor=await this.homeService.getRealtorByHomeId(id)
        if(realtor.id!==user.id){
            throw new UnauthorizedException()
        }
        return this.homeService.deleteHome(id)
    }

    @Roles(UserType.BUYER)
    @Post("/inquire/:id")
    inquire(
        @Param("id" ,ParseIntPipe) homeId:number,
        @User() user,
        @Body() {message}:InquireDto
    ){
        return this.homeService.inquire(user,homeId,message)
    }

    @Roles(UserType.REALTOR)    
    @Get("/:id/messages")
    async getHomeMessages(
         @Param("id",ParseIntPipe) homeId:number,
         @User() user
    ){        
        const realtor=await this.homeService.getRealtorByHomeId(homeId)
        if(realtor.id!==user.id){
            throw new UnauthorizedException()
        }
        return this.homeService.homeMessages(homeId)
    }

    
}
