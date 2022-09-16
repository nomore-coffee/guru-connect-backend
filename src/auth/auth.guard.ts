import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const request = context.switchToHttp().getRequest<Request>();
    const request = context.switchToHttp().getRequest();
    const { authorization }: any = request.headers;
    let authorizationString = '';
    if (Array.isArray(authorization)) {
      authorizationString = authorization[0];
    } else {
      authorizationString = authorization;
    }

    const validateTokenResponse = await this.authorizedByCognito(
      authorizationString,
      request,
    );
    // console.log('validateTokenResponse', validateTokenResponse.payload);

    // console.log('request', request.url);
    if (validateTokenResponse.valid) {
      request['payload'] = validateTokenResponse.payload;
      if (
        request.url !== '/test/verifyEmail' &&
        request.url !== '/test/updateCognitoOrganization' &&
        !validateTokenResponse.payload.nickname
      ) {
        let userData = await this.authService.checkUserInDB(
          {
            sub: validateTokenResponse.payload.sub,
            emailId: validateTokenResponse.payload.email,
          },
          { _id: 1 },
        );
        // console.log('userData', userData);
        request['payload'] = {
          ...validateTokenResponse.payload,
          nickname: userData._id.toString(),
        };
      }
      return true;
    }
    return false;
  }

  async authorizedByCognito(authHeader: string, request: any): Promise<any> {
    if (!authHeader) {
      throw new UnauthorizedException(`Authorization header is required`);
    }
    const tokenArray = authHeader.split(' ', 2);
    if (!tokenArray[0] || tokenArray[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Token type must be Bearer');
    }
    try {
      console.log('>>>>>>>>>>>>>', tokenArray[1]);
      const validatedData = await this.authService.validateToken(tokenArray[1]);
      request.validatedData = validatedData.payload;
      return validatedData;
    } catch (e) {
      if (e.message === 'Session expired. Please login again.') {
        throw new HttpException(
          {
            status: 455,
            error: 'Session expired. Please login again.',
          },
          455,
        );
      } else {
        throw new UnauthorizedException(e.message);
      }
    }
  }
}
