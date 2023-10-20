import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppconfigService } from './appconfig.service';

@Injectable()
export class AppconfigInterceptor implements NestInterceptor {
  constructor(private readonly appconfigService: AppconfigService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const appconfData = await this.appconfigService.appconfigJobs();

    if (appconfData && appconfData?.value?.maintenance == true) {
      throw new ForbiddenException({
        code: HttpStatus.FORBIDDEN,
        message: 'API is under maintenance',
        context: context.switchToHttp().getRequest,
      });
    }
    return next.handle();
  }
}
