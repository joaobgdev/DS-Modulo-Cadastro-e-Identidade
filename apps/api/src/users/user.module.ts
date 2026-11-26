import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdministrativeController } from './administrative.controller';
import { AdministrativeService } from './administrative.service';
import { KeycloakAdminService } from './keycloak-admin.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule],
  controllers: [UserController, AdministrativeController],
  providers: [UserService, KeycloakAdminService, AdministrativeService],
  exports: [UserService, AdministrativeService],
})
export class UserModule {}