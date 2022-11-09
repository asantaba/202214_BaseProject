import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from './supermercado.entity';
import * as businessErrors from '../shared/errors/business-errors';

@Injectable()
export class SupermercadoService {
  private relations = ['ciudades'];

  @InjectRepository(SupermercadoEntity)
  private readonly supermercadoRepositorio: Repository<SupermercadoEntity>;

  async findAll(): Promise<SupermercadoEntity[]> {
    return await this.supermercadoRepositorio.find({
      relations: this.relations,
    });
  }

  async findOne(id: string): Promise<SupermercadoEntity> {
    const supermercado: SupermercadoEntity =
      await this.supermercadoRepositorio.findOne({
        where: { id },
        relations: this.relations,
      });
    if (!supermercado) {
      throw new businessErrors.BusinessLogicException(
        'Supermercado no encontrado',
        404,
      );
    }
    return supermercado;
  }

  async create(supermercado: SupermercadoEntity): Promise<SupermercadoEntity> {
    if (supermercado.nombre.length < 11) {
      throw new businessErrors.BusinessLogicException(
        'El nombre del Supermercado debe tener más de 10 caracteres.',
        400,
      );
    }
    return await this.supermercadoRepositorio.save(supermercado);
  }

  async update(
    id: string,
    supermercado: SupermercadoEntity,
  ): Promise<SupermercadoEntity> {
    if (supermercado.nombre.length < 11) {
      throw new businessErrors.BusinessLogicException(
        'El nombre del Supermercado debe tener más de 10 caracteres.',
        400,
      );
    }
    const supermercadoActualizar: SupermercadoEntity =
      await this.supermercadoRepositorio.findOne({ where: { id } });
    if (!supermercadoActualizar) {
      throw new businessErrors.BusinessLogicException(
        `El supermercado con el id ${id} no se encontró.`,
        404,
      );
    }
    return await this.supermercadoRepositorio.save({
      ...supermercadoActualizar,
      ...supermercado,
    });
  }

  async delete(id: string) {
    const supermercadoBorrar: SupermercadoEntity =
      await this.supermercadoRepositorio.findOne({
        where: { id },
      });
    if (!supermercadoBorrar) {
      throw new businessErrors.BusinessLogicException(
        `El supermercado con el id ${id} no se encontró.`,
        404,
      );
    }
    await this.supermercadoRepositorio.remove(supermercadoBorrar);
  }
}
