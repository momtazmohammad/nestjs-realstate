import {CanActivate,Injectable,ExecutionContext} from "@nestjs/common"
import {Reflector} from "@nestjs/core"
import * as jwt from "jsonwebtoken";
import { PrismaService } from "src/prisma/prisma.service";
interface Payload{
    name: string,
    id: number,
    email: string,
    iat: number,
    exp: number
}
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector:Reflector,
        private readonly prismaService:PrismaService){}
async    canActivate(context:ExecutionContext){
        const roles=this.reflector.getAllAndOverride('roles',[
            context.getHandler(),
            context.getClass()
        ])
        if(roles?.length){
            const request=context.switchToHttp().getRequest();
            const token=request.headers?.authtoken
            try{
            const payload=await jwt.verify(token,process.env.JSON_SECRET_KEY) as Payload
            const user=await this.prismaService.user.findUnique({
                where:{id:payload.id}
            })
            if(!user) return false
            if(roles.includes(user.user_type)) return true
            return false
            }catch(err){
                return false
            }
        }
        return true
    }

}