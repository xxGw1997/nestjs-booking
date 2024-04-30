import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class CustomValidationPipe extends ValidationPipe {
  protected flattenValidationErrors(
    validationErrors: ValidationError[],
  ): string[] {
    const errorMessages = [];

    validationErrors.forEach((error) => {
      errorMessages.push(...Object.values(error.constraints));
    });

    if (errorMessages.length > 0) {
      throw new HttpException(
        {
          code: 422,
          message: errorMessages,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return errorMessages;
  }
}
