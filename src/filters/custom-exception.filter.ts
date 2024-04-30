import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const data = exception.getResponse()?.['message'] ?? exception.message;

    response
      .json({
        code: exception.getStatus(),
        message: 'fail',
        data,
      })
      .end();
  }
}
