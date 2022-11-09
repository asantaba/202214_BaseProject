import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SupermercadoDto } from './supermercado.dto';
import { SupermercadoEntity } from './supermercado.entity';
import { SupermercadoService } from './supermercado.service';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';

@Controller('supermarkets')
@UseInterceptors(BusinessErrorsInterceptor)
export class SupermercadoController {
  constructor(private readonly supermercadoService: SupermercadoService) {}

  a = 'var with invalid name';
  b = 'var with invalid name';
  c = 'var with invalid name';
  functionWithoutUse(): void {
    if (this.a === '') {
      if (this.b === 'a') {
        if (this.c == '2') {
        } else {
          if (true) {
          }
        }
      }
    }
  }

  functionWithLotOfParameters(
    a: string,
    b: string,
    c: string,
    a1: string,
    b1: string,
    c1: string,
    a2: string,
    b2: string,
    c2: string,
    a3: string,
    b3: string,
    c3: string,
    a4: string,
    b4: string,
    c4: string,
    a5: string,
    b5: string,
    c5: string,
    a6: string,
    b6: string,
    c6: string,
  ): void {
    if (a === '') {
      if (b === 'a') {
        if (c == '2') {
        } else {
          console.log(a1 + b1 + c1);
          console.log(a2 + b2 + c2);
          console.log(a3 + b3 + c3);
          console.log(a4 + b4 + c4);
          console.log(a5 + b5 + c5);
          console.log(a6 + b6 + c6);
        }
      }
    }
  }

  @Get()
  async findAll() {
    return await this.supermercadoService.findAll();
  }

  @Get(':supermercadoId')
  async findOne(@Param('supermercadoId') supermercadoId: string) {
    return await this.supermercadoService.findOne(supermercadoId);
  }

  @Post()
  async create(@Body() supermercadoDto: SupermercadoDto) {
    const supermercado: SupermercadoEntity = plainToInstance(
      SupermercadoEntity,
      supermercadoDto,
    );
    return await this.supermercadoService.create(supermercado);
  }

  @Put(':supermercadoId')
  async update(
    @Param('supermercadoId') supermercadoId: string,
    @Body() supermercadoDto: SupermercadoDto,
  ) {
    const supermercado: SupermercadoEntity = plainToInstance(
      SupermercadoEntity,
      supermercadoDto,
    );
    return await this.supermercadoService.update(supermercadoId, supermercado);
  }

  @Delete(':supermercadoId')
  @HttpCode(204)
  async delete(@Param('supermercadoId') supermercadoId: string) {
    return await this.supermercadoService.delete(supermercadoId);
  }
}
