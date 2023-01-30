import {NestInterceptor,ExecutionContext,CallHandler} from "@nestjs/common"
import * as jwt from "jsonwebtoken";
//import {map} from "rxjs"

export class UserInterceptor implements NestInterceptor{
    async intercept(
        context:ExecutionContext,handler:CallHandler
    ){
        const request=context.switchToHttp().getRequest();
        const token=request?.cookies['jwt']            
        //const token=request?.headers?.authtoken
        if(token){
            const user=await jwt.decode(token)
            request.user=user
        }
        return handler.handle() //we can change the response
        /*
        return handler.handle().pipe(
            map((data)=>{
                const reponse={
                    ...data,
                    createdAt:data.created_at
                }
                delete response.created_at
                return response
            }
        )
        */
    }
}