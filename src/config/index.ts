import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  database: process.env.REDIS_DATABASE,
  ttl: process.env.REDIS_TTL,
}));

export const emailConfig = registerAs('email', () => ({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  pass: process.env.EMAIL_PASS,
  user: process.env.EMAIL_USER,
  from_name: process.env.EMAIL_FROM_NAME,
}));
