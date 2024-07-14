import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IAuthenticatedUser } from '../authentication/jwt.strategy';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: IAuthenticatedUser = request.user;

    // Prototype auth logic
    return user && user.userId ? true : false;
  }
}
