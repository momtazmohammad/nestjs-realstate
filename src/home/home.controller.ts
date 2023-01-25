import { Controller, Get,UseGuards } from '@nestjs/common';
import { Delete, Post, Put } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { Body, Param, Query } from '@nestjs/common/decorators/http/route-params.decorator';
import {  UnauthorizedException } from '@nestjs/common/exceptions';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { PropertyType, UserType } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dtos/home.dto';
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
    @Roles(UserType.REALTOR,UserType.ADMIN)
    @UseGuards(AuthGuard)
    @Post()
    createHome(
        @Body() body:CreateHomeDto,
        @User() user        
    ){     return "createdhome   "
         //return this.homeService.createHome(body,user.id)
    }
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
}
