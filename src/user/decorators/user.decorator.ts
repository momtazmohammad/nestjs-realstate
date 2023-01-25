import { BadRequestException, createParamDecorator,ExecutionContext } from "@nestjs/common";

export const User=createParamDecorator((data,context:ExecutionContext)=>{
    const request=context.switchToHttp().getRequest()
    if(!request?.user){
        throw new BadRequestException()
    }
    return request?.user            
})