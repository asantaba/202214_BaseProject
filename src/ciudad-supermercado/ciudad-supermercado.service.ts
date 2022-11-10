import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class CiudadSupermercadoService {
  constructor(
    @InjectRepository(CiudadEntity)
    private readonly ciudadRepositorio: Repository<CiudadEntity>,

    @InjectRepository(SupermercadoEntity)
    private readonly supermercadoRepositorio: Repository<SupermercadoEntity>,
  ) {}

  private decideBetweenObjects(
    ciudad: CiudadEntity,
    supermercado: SupermercadoEntity,
  ): void {
    let a = null;
    if (ciudad != null) {
      a = ciudad;
    } else {
      if (supermercado != null) {
        a = supermercado;
      }
    }

    if (a == null) {
      console.log('a is null');
    }
  }

  private async getCiudadPorId(ciudadId: string): Promise<CiudadEntity> {
    const ciudad: CiudadEntity = await this.ciudadRepositorio.findOne({
      where: { id: ciudadId },
      relations: ['supermercados'],
    });
    if (!ciudad) {
      throw new BusinessLogicException(
        `La ciudad con id ${ciudadId} no existe`,
        BusinessError.NOT_FOUND,
      );
    }
    return ciudad;
  }

  private async getSupermercadoPorId(
    supermercadoId: string,
  ): Promise<SupermercadoEntity> {
    const supermercado: SupermercadoEntity =
      await this.supermercadoRepositorio.findOne({
        where: { id: supermercadoId },
        relations: ['ciudades'],
      });
    if (!supermercado) {
      throw new BusinessLogicException(
        `El supermercado con id ${supermercadoId} no existe`,
        BusinessError.NOT_FOUND,
      );
    }
    return supermercado;
  }

  private buscarSupermercadoEnCiudad(
    supermercado: SupermercadoEntity,
    ciudad: CiudadEntity,
  ): SupermercadoEntity {
    const supermercadoCiudad: SupermercadoEntity = ciudad.supermercados.find(
      (s) => s.id === supermercado.id,
    );

    if (!supermercadoCiudad) {
      throw new BusinessLogicException(
        `El supermercado indicado con id ${supermercado.id} no esta relacionado a la ciudad especificada con id ${ciudad.id}`,
        BusinessError.NOT_FOUND,
      );
    }
    return supermercadoCiudad;
  }

  async addSupermarketToCity(
    ciudadId: string,
    supermercadoId: string,
  ): Promise<CiudadEntity> {
    const supermercado: SupermercadoEntity = await this.getSupermercadoPorId(
      supermercadoId,
    );
    const ciudad: CiudadEntity = await this.getCiudadPorId(ciudadId);

    ciudad.supermercados = [...ciudad.supermercados, supermercado];
    return await this.ciudadRepositorio.save(ciudad);
  }

  async findSupermarketsFromCity(
    ciudadId: string,
  ): Promise<SupermercadoEntity[]> {
    const ciudad: CiudadEntity = await this.getCiudadPorId(ciudadId);
    return ciudad.supermercados;
  }

  async findSupermarketFromCity(
    ciudadId: string,
    supermercadoId: string,
  ): Promise<SupermercadoEntity> {
    const ciudad: CiudadEntity = await this.getCiudadPorId(ciudadId);
    const supermercado: SupermercadoEntity = await this.getSupermercadoPorId(
      supermercadoId,
    );
    const supermercadoCiudad = this.buscarSupermercadoEnCiudad(
      supermercado,
      ciudad,
    );
    return supermercadoCiudad;
  }

  async updateSupermarketsFromCity(
    ciudadId: string,
    supermercados: SupermercadoEntity[],
  ): Promise<CiudadEntity> {
    const ciudad: CiudadEntity = await this.getCiudadPorId(ciudadId);

    for (const element of supermercados) {
      await this.getSupermercadoPorId(element.id);
    }

    ciudad.supermercados = supermercados;
    return await this.ciudadRepositorio.save(ciudad);
  }

  async deleteSupermarketFromCity(ciudadId: string, supermercadoId: string) {
    const ciudad: CiudadEntity = await this.getCiudadPorId(ciudadId);
    const supermercado: SupermercadoEntity = await this.getSupermercadoPorId(
      supermercadoId,
    );
    this.buscarSupermercadoEnCiudad(supermercado, ciudad);
    ciudad.supermercados = ciudad.supermercados.filter(
      (s) => s.id !== supermercadoId,
    );
    await this.ciudadRepositorio.save(ciudad);
  }
}
