import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity';
import * as businessErrors from '../shared/errors/business-errors';
import { isIn } from 'class-validator';

@Injectable()
export class CiudadService {
  private relations = ['supermercados'];
  private paisesValidos = ['Argentina', 'Ecuador', 'Paraguay'];

  @InjectRepository(CiudadEntity)
  private readonly ciudadRepositorio: Repository<CiudadEntity>;

  async findAll(): Promise<CiudadEntity[]> {
    return await this.ciudadRepositorio.find({
      relations: this.relations,
    });
  }

  async findOne(id: string): Promise<CiudadEntity> {
    const ciudad: CiudadEntity = await this.ciudadRepositorio.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!ciudad) {
      throw new businessErrors.BusinessLogicException(
        'Ciudad no encontrada',
        businessErrors.BusinessError.NOT_FOUND,
      );
    }
    return ciudad;
  }

  async create(ciudad: CiudadEntity): Promise<CiudadEntity> {
    if (!isIn(ciudad.pais, this.paisesValidos)) {
      throw new businessErrors.BusinessLogicException(
        'El pais de la Ciudad no puede ser ' + ciudad.pais,
        businessErrors.BusinessError.BAD_REQUEST,
      );
    }
    return await this.ciudadRepositorio.save(ciudad);
  }

  async update(id: string, ciudad: CiudadEntity): Promise<CiudadEntity> {
    if (!isIn(ciudad.pais, this.paisesValidos)) {
      throw new businessErrors.BusinessLogicException(
        'El pais de la Ciudad no puede ser ' + ciudad.pais,
        businessErrors.BusinessError.BAD_REQUEST,
      );
    }
    const ciudadActualizar: CiudadEntity = await this.ciudadRepositorio.findOne(
      { where: { id } },
    );
    if (!ciudadActualizar) {
      throw new businessErrors.BusinessLogicException(
        `La ciudad con el id ${id} no se encontró.`,
        businessErrors.BusinessError.NOT_FOUND,
      );
    }
    return await this.ciudadRepositorio.save({
      ...ciudadActualizar,
      ...ciudad,
    });
  }

  async delete(id: string) {
    const ciudadBorrar: CiudadEntity = await this.ciudadRepositorio.findOne({
      where: { id },
    });
    if (!ciudadBorrar) {
      throw new businessErrors.BusinessLogicException(
        `La ciudad con el id ${id} no se encontró.`,
        businessErrors.BusinessError.NOT_FOUND,
      );
    }
    await this.ciudadRepositorio.remove(ciudadBorrar);
  }
}
