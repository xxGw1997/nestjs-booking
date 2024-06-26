import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { emailConfig } from '@/config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(emailConfig)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
