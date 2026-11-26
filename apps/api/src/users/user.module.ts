import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdministrativeController } from './administrative.controller';
import { AdministrativeService } from './administrative.service';
import { ClinicController } from './clinic.controller';
import { ClinicService } from './clinic.service';
import { KeycloakAdminService } from './keycloak-admin.service';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule],
  controllers: [UserController, RegistrationController, AdministrativeController, ClinicController],
  providers: [UserService, KeycloakAdminService, AdministrativeService, ClinicService, RegistrationService],
  exports: [UserService, AdministrativeService, ClinicService],
})
export class UserModule {}