import { Injectable,BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';

interface GetHomesParams{
    city?:string,
    price?:{
        gte?:number,
        lte?:number
    },
    propertyType?:PropertyType
}
interface CreateHomeParams{
    address:string;
  numberOfBedrooms:number;
  numberOfBathrooms:number;
  city:string; 
  price:number;
  landSize:number;
  propertyType:PropertyType;
  images:{url:string}[];
}
interface UpdateHomeParams{    
    address?:string;
  numberOfBedrooms?:number;
  numberOfBathrooms?:number;
  city?:string; 
  price?:number;
  landSize?:number;
  propertyType?:PropertyType;  
}
@Injectable()
export class HomeService {
    constructor(private readonly prismaService:PrismaService){}
    async getHomes(filter:GetHomesParams) : Promise<HomeResponseDto[]>{
        const homes=await this.prismaService.home.findMany(
                        {
                select:{
                    id:true,
                    address:true,
                    city:true,
                    price:true,
                    property_type:true,
                    number_of_bathrooms:true,
                    number_of_bedrooms:true,
                    images:{
                        select:{
                            url:true
                        },
                        take: 1
                    }
                },
                where:filter,
            }        
        )
        return homes.map(home=>{
            const fetchedHome={...home,image:home.images[0].url};
            delete fetchedHome["images"]
            return new HomeResponseDto(fetchedHome)
        })
    }
    async getHome(id:number) :Promise<HomeResponseDto>{
        const home=await this.prismaService.home.findFirst({
            where:{
                id
            }
        });        
        if(!home){
            throw new BadRequestException()
        }
        return new HomeResponseDto(home)
    }
    async createHome({address,
        numberOfBedrooms,
        numberOfBathrooms,
        city,
        price,
        landSize,
        propertyType,
        images
        }:CreateHomeParams,userId:number){            
        const home=await this.prismaService.home.create({
            data:{address,
                number_of_bedrooms:numberOfBedrooms,
                number_of_bathrooms:numberOfBathrooms,
                city,
                price,
                land_size: landSize,
                property_type: propertyType,
            realtor_id:userId}
        })
        const homeImages=images.map(image=>{
            return {...image,home_id:home.id}})
        await this.prismaService.image.createMany({
            data: homeImages
        })
        return new HomeResponseDto(home)
    }
    async updateHome(id:number,data:UpdateHomeParams){
            const home= await this.prismaService.home.findFirst({
                where:{id}
            })
            if(!home){
                throw new NotFoundException();
            }
            const updatedHome=await this.prismaService.home.update({where:{id},data})
            return new HomeResponseDto(updatedHome)
        }
        async deleteHome(id:number){            
            
            const home= await this.prismaService.home.findUnique({
                where:{id}
            })
            if(!home){
                throw new NotFoundException();
            }

                await this.prismaService.image.deleteMany({
                    where:{
                        home_id:id
                    }
                })
                await this.prismaService.home.delete({
                    where:{
                        id
                    }
                })

        }
        async getRealtorByHomeId(id:number){
            const home=await this.prismaService.home.findUnique({
                where:{
                    id
                },
                select:{
                    realtor:{
                        select:{
                            name:true,
                            id:true,
                            email:true,
                            phone:true
                        }
                    }
                }
            })
            if(!home){
                throw new NotFoundException()
            }
            return home.realtor
        }
}
