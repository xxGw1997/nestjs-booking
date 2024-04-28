import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthenticationController } from './authentication/authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Role } from './entity/role.entity';
import { Permission } from './entity/permission.entity';
import { AuthenticationService } from './authentication/authentication.service';
import { BcryptService } from './hashing/bcrypto.service';
import { HashingService } from './hashing/hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UserController, AuthenticationController],
  providers: [
    UserService,
    AuthenticationService,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
})
export class UserModule {}
