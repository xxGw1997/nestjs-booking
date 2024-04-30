import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export class UnAuthException {
  message: string;
  constructor(message?: string) {
    this.message = message || '用户未登录';
  }
}

@Catch(UnAuthException)
export class UnAuthFilter implements ExceptionFilter {
  catch(exception: UnAuthException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response
      .json({
        code: HttpStatus.UNAUTHORIZED,
        message: 'fail',
        data: exception.message || '用户未登录',
      })
      .end();
  }
}
