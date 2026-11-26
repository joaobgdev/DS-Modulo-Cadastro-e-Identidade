import { Body, Controller, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../access/access.decorators';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { ClinicProfileResponseDto, CreateClinicUserDto } from './clinic.dto';
import { ClinicService } from './clinic.service';

@ApiTags('clinics')
@ApiCookieAuth('appstart_session')
@Controller('users/clinics')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cadastrar clínica' })
  @ApiResponse({ status: 201, type: ClinicProfileResponseDto })
  @ApiResponse({ status: 400, type: ProblemDetailsDto })
  @ApiResponse({ status: 409, type: ProblemDetailsDto })
  create(@Body() dto: CreateClinicUserDto): Promise<ClinicProfileResponseDto> {
    return this.clinicService.create(dto);
  }
}
