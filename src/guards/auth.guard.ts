import {CanActivate,Injectable,ExecutionContext} from "@nestjs/common"
import {Reflector} from "@nestjs/core"

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector:Reflector){}
    canActivate(context:ExecutionContext){
        const roles=this.reflector.getAllAndOverride('roles',[
            context.getHandler(),
            context.getClass()
        ])
        console.log(roles)
        return true
    }

}