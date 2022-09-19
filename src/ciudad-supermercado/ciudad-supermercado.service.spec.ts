import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import {
  crearCiudadFake,
  crearSupermercadoFake,
} from '../shared/testing-utils/entity-factories';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { Repository } from 'typeorm';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';

describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepositorio: Repository<CiudadEntity>;
  let supermercadoRepositorio: Repository<SupermercadoEntity>;
  let ciudades: CiudadEntity[];
  let supermercados: SupermercadoEntity[];

  const seedDatabase = async () => {
    supermercadoRepositorio.clear();
    ciudadRepositorio.clear();
    ciudades = [];
    supermercados = [];
    for (let i = 0; i < 5; i++) {
      const ciudad: CiudadEntity = await ciudadRepositorio.save(
        crearCiudadFake(),
      );
      ciudades.push(ciudad);

      const supermercado: SupermercadoEntity =
        await supermercadoRepositorio.save(crearSupermercadoFake());
      supermercados.push(supermercado);
    }

    for (let i = 0; i < 5; i++) {
      supermercados[i].ciudades = ciudades;
      supermercados[i] = await supermercadoRepositorio.save(supermercados[i]);
      ciudades[i].supermercados = supermercados;
      ciudades[i] = await ciudadRepositorio.save(ciudades[i]);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);
    supermercadoRepositorio = module.get<Repository<SupermercadoEntity>>(
      getRepositoryToken(SupermercadoEntity),
    );
    ciudadRepositorio = module.get<Repository<CiudadEntity>>(
      getRepositoryToken(CiudadEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addSupermarketToCity::', () => {
    it('Debe agregar un supermercado a una ciudad', async () => {
      const nuevaCiudad: CiudadEntity = await ciudadRepositorio.save(
        crearCiudadFake(),
      );
      const nuevoSupermercado: SupermercadoEntity =
        await supermercadoRepositorio.save(crearSupermercadoFake());
      const resultado = await service.addSupermarketToCity(
        nuevaCiudad.id,
        nuevoSupermercado.id,
      );

      expect(resultado.supermercados.length).toBe(1);
      expect(resultado.supermercados[0]).not.toBeNull();
      expect(resultado.supermercados[0].nombre).toEqual(
        nuevoSupermercado.nombre,
      );
      expect(resultado.supermercados[0].longitud).toEqual(
        nuevoSupermercado.longitud,
      );
      expect(resultado.supermercados[0].latitud).toEqual(
        nuevoSupermercado.latitud,
      );
      expect(resultado.supermercados[0].paginaWeb).toEqual(
        nuevoSupermercado.paginaWeb,
      );
    });

    it('Debe retornar un error con una ciudad invalida', async () => {
      const nuevoSupermercado: SupermercadoEntity =
        await supermercadoRepositorio.save(crearSupermercadoFake());
      await expect(() =>
        service.addSupermarketToCity('0', nuevoSupermercado.id),
      ).rejects.toHaveProperty('message', 'La ciudad con id 0 no existe');
    });

    it('Debe retornar un error con un supermercado invalido', async () => {
      const nuevaCiudad: CiudadEntity = await ciudadRepositorio.save(
        crearCiudadFake(),
      );
      await expect(() =>
        service.addSupermarketToCity(nuevaCiudad.id, '0'),
      ).rejects.toHaveProperty('message', 'El supermercado con id 0 no existe');
    });
  });

  describe('findSupermarketsFromCity:: ', () => {
    it('Debe retornar los supermercados de una ciudad', async () => {
      const supermercados: SupermercadoEntity[] =
        await service.findSupermarketsFromCity(ciudades[0].id);
      expect(supermercados.length).toBe(5);
    });

    it('Debe retornar un error con una ciudad invalida', async () => {
      await expect(() =>
        service.findSupermarketsFromCity('0'),
      ).rejects.toHaveProperty('message', 'La ciudad con id 0 no existe');
    });
  });

  describe('findSupermarketFromCity:: ', () => {
    it('Debe retornar el supermercado de una ciudad por sus IDs', async () => {
      const ciudad: CiudadEntity = ciudades[0];
      const supermercado: SupermercadoEntity = supermercados[0];
      const supermercadoBD: SupermercadoEntity =
        await service.findSupermarketFromCity(ciudad.id, supermercado.id);
      expect(supermercadoBD).not.toBeNull();
      expect(supermercadoBD.nombre).toEqual(supermercado.nombre);
      expect(supermercadoBD.latitud).toEqual(supermercado.latitud);
      expect(supermercadoBD.longitud).toEqual(supermercado.longitud);
      expect(supermercadoBD.paginaWeb).toEqual(supermercado.paginaWeb);
    });

    it('Debe retornar error cuando se pasa una ciudad invalida', async () => {
      const supermercado: SupermercadoEntity = supermercados[0];
      await expect(() =>
        service.findSupermarketFromCity('0', supermercado.id),
      ).rejects.toHaveProperty('message', 'La ciudad con id 0 no existe');
    });

    it('Debe retornar error cuando se pasa un supermercado invalido', async () => {
      const ciudad: CiudadEntity = ciudades[0];
      await expect(() =>
        service.findSupermarketFromCity(ciudad.id, '0'),
      ).rejects.toHaveProperty('message', 'El supermercado con id 0 no existe');
    });

    it('Debe retornar error cuando el supermercado no esta asociado a la ciudad', async () => {
      const nuevoSupermercado: SupermercadoEntity =
        await supermercadoRepositorio.save(crearSupermercadoFake());
      const ciudad: CiudadEntity = ciudades[0];
      await expect(() =>
        service.findSupermarketFromCity(ciudad.id, nuevoSupermercado.id),
      ).rejects.toHaveProperty(
        'message',
        `El supermercado indicado con id ${nuevoSupermercado.id} no esta relacionado a la ciudad especificada con id ${ciudad.id}`,
      );
    });
  });

  describe('updateSupermarketsFromCity:: ', () => {
    it('Debe actualizar los supermercados de una ciudad', async () => {
      const nuevoSupermercado: SupermercadoEntity =
        await supermercadoRepositorio.save(crearSupermercadoFake());
      const ciudadActualizada: CiudadEntity =
        await service.updateSupermarketsFromCity(ciudades[0].id, [
          nuevoSupermercado,
        ]);

      expect(ciudadActualizada.supermercados.length).toBe(1);
      expect(ciudadActualizada.supermercados[0].nombre).toEqual(
        nuevoSupermercado.nombre,
      );
      expect(ciudadActualizada.supermercados[0].latitud).toEqual(
        nuevoSupermercado.latitud,
      );
      expect(ciudadActualizada.supermercados[0].longitud).toEqual(
        nuevoSupermercado.longitud,
      );
      expect(ciudadActualizada.supermercados[0].paginaWeb).toEqual(
        nuevoSupermercado.paginaWeb,
      );
    });

    it('Debe retornar error cuando se pasa un ciudad invalida', async () => {
      const nuevoSupermercado: SupermercadoEntity =
        await supermercadoRepositorio.save(crearSupermercadoFake());

      await expect(() =>
        service.updateSupermarketsFromCity('0', [nuevoSupermercado]),
      ).rejects.toHaveProperty('message', 'La ciudad con id 0 no existe');
    });

    it('Debe retornar error cuando se pasa un supermercado invalido', async () => {
      const nuevoSupermercado: SupermercadoEntity = supermercados[0];
      nuevoSupermercado.id = '0';
      await expect(() =>
        service.updateSupermarketsFromCity(ciudades[0].id, [nuevoSupermercado]),
      ).rejects.toHaveProperty('message', 'El supermercado con id 0 no existe');
    });
  });

  describe('deleteSupermarketFromCity:: ', () => {
    it('Debe eliminar un supermercado de una ciudad especificada', async () => {
      const supermercado: SupermercadoEntity = supermercados[0];
      await service.deleteSupermarketFromCity(ciudades[0].id, supermercado.id);
      const ciudadBD: CiudadEntity = await ciudadRepositorio.findOne({
        where: { id: ciudades[0].id },
        relations: ['supermercados'],
      });
      const supermercadoBorrado: SupermercadoEntity =
        ciudadBD.supermercados.find((s) => s.id === supermercado.id);
      expect(supermercadoBorrado).toBeUndefined();
    });

    it('Debe retornar error cuando se pasa una ciudad invalida', async () => {
      const supermercado: SupermercadoEntity = supermercados[0];
      await expect(() =>
        service.deleteSupermarketFromCity('0', supermercado.id),
      ).rejects.toHaveProperty('message', 'La ciudad con id 0 no existe');
    });

    it('Debe retornar error cuando se pasa un supermercado invalido', async () => {
      await expect(() =>
        service.deleteSupermarketFromCity(ciudades[0].id, '0'),
      ).rejects.toHaveProperty('message', 'El supermercado con id 0 no existe');
    });

    it('Debe retornar error cuando el supermercado no pertenece a la ciudad', async () => {
      const nuevoSupermercado: SupermercadoEntity =
        await supermercadoRepositorio.save(crearSupermercadoFake());
      await expect(() =>
        service.deleteSupermarketFromCity(ciudades[0].id, nuevoSupermercado.id),
      ).rejects.toHaveProperty(
        'message',
        `El supermercado indicado con id ${nuevoSupermercado.id} no esta relacionado a la ciudad especificada con id ${ciudades[0].id}`,
      );
    });
  });
});
