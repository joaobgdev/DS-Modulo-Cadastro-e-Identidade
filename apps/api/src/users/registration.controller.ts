import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../access/access.decorators';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { CreateRegistrationDto, RegistrationResponseDto } from './registration.dto';
import { RegistrationService } from './registration.service';

@ApiTags('users')
@Controller('users')
export class RegistrationController {
  constructor(private readonly registrations: RegistrationService) {}

  @Post('registrations')
  @Public()
  @ApiOperation({ summary: 'Solicitar cadastro de um perfil' })
  @ApiResponse({ status: 201, type: RegistrationResponseDto })
  @ApiResponse({ status: 400, type: ProblemDetailsDto })
  @ApiResponse({ status: 409, type: ProblemDetailsDto })
  register(@Body() dto: CreateRegistrationDto): Promise<RegistrationResponseDto> {
    return this.registrations.create(dto);
  }
}
