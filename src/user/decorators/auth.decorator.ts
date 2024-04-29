import { SetMetadata } from '@nestjs/common';

export const AUTH_KEY = 'auth';

export enum AuthType {
  Bearer,
  None,
}

export const Auth = (...authTyps: AuthType[]) =>
  SetMetadata(AUTH_KEY, authTyps);
