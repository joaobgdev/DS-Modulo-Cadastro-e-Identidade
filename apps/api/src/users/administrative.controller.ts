import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../access/access.decorators';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import {
  AdministrativeProfileResponseDto,
  CreateAdministrativeUserDto,
} from './administrative.dto';
import { AdministrativeService } from './administrative.service';

@ApiTags('administrative')
@ApiCookieAuth('appstart_session')
@Controller('users/administrative')
export class AdministrativeController {
  constructor(private readonly administrativeService: AdministrativeService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CLINICA)
  @ApiOperation({ summary: 'Cadastrar profissional administrativo' })
  @ApiResponse({ status: 201, type: AdministrativeProfileResponseDto })
  @ApiResponse({ status: 400, type: ProblemDetailsDto })
  @ApiResponse({ status: 409, type: ProblemDetailsDto })
  create(@Body() dto: CreateAdministrativeUserDto): Promise<AdministrativeProfileResponseDto> {
    return this.administrativeService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CLINICA)
  @ApiOperation({ summary: 'Listar profissionais administrativos' })
  @ApiResponse({ status: 200, type: [AdministrativeProfileResponseDto] })
  findAll(): Promise<AdministrativeProfileResponseDto[]> {
    return this.administrativeService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CLINICA, UserRole.ADMINISTRATIVO)
  @ApiOperation({ summary: 'Consultar dados funcionais de um profissional administrativo' })
  @ApiResponse({ status: 200, type: AdministrativeProfileResponseDto })
  @ApiResponse({ status: 404, type: ProblemDetailsDto })
  findById(@Param('id') id: string): Promise<AdministrativeProfileResponseDto> {
    return this.administrativeService.findById(id);
  }
}