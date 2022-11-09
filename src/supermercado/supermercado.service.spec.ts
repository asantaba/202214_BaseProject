import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { crearSupermercadoFake } from '../shared/testing-utils/entity-factories';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from './supermercado.entity';
import { SupermercadoService } from './supermercado.service';

describe('SupermercadoService', () => {
  let service: SupermercadoService;
  let repositorio: Repository<SupermercadoEntity>;
  let supermercadosList = [];

  const seedDatabase = async () => {
    supermercadosList = [];
    repositorio.clear();
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity = await repositorio.save(
        crearSupermercadoFake(),
      );
      supermercadosList.push(supermercado);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SupermercadoService],
    }).compile();

    service = module.get<SupermercadoService>(SupermercadoService);
    repositorio = module.get<Repository<SupermercadoEntity>>(
      getRepositoryToken(SupermercadoEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll:: debe retornar todas los supermercados', async () => {
    const supermercados: SupermercadoEntity[] = await service.findAll();
    expect(supermercados).not.toBeNull();
    expect(supermercados).toHaveLength(supermercadosList.length);
  });

  it('findOne:: Debe retornar un supermercado por su id', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    const supermercadoEncontrada: SupermercadoEntity = await service.findOne(
      supermercado.id,
    );
    expect(supermercadoEncontrada).not.toBeNull();
    expect(supermercadoEncontrada.nombre).toEqual(supermercado.nombre);
    expect(supermercadoEncontrada.latitud).toEqual(supermercado.latitud);
    expect(supermercadoEncontrada.longitud).toEqual(supermercado.longitud);
    expect(supermercadoEncontrada.paginaWeb).toEqual(supermercado.paginaWeb);
  });

  it('findOne:: debe retornar una excepcion con un ID invalido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'Supermercado no encontrado',
    );
  });

  it('create:: Debe registrar un nuevo supermercado', async () => {
    const nuevoSupermercado: SupermercadoEntity = await service.create(
      crearSupermercadoFake(),
    );
    expect(nuevoSupermercado).not.toBeNull();

    const supermercadoAlmacenado: SupermercadoEntity =
      await repositorio.findOne({
        where: { id: nuevoSupermercado.id },
      });
    expect(supermercadoAlmacenado).not.toBeNull();
    expect(supermercadoAlmacenado.nombre).toEqual(nuevoSupermercado.nombre);
    expect(supermercadoAlmacenado.latitud).toEqual(nuevoSupermercado.latitud);
    expect(supermercadoAlmacenado.longitud).toEqual(nuevoSupermercado.longitud);
    expect(supermercadoAlmacenado.paginaWeb).toEqual(
      nuevoSupermercado.paginaWeb,
    );
  });

  it('update:: Debe modificar un supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.nombre = 'Nuevo Nombre';
    supermercado.latitud = '111111';
    supermercado.longitud = '111111';
    supermercado.paginaWeb = 'Nueva pagina web';
    const supermercadoActualizado: SupermercadoEntity = await service.update(
      supermercado.id,
      supermercado,
    );
    expect(supermercadoActualizado).not.toBeNull();
    expect(supermercadoActualizado.nombre).toEqual(supermercado.nombre);
    expect(supermercadoActualizado.longitud).toEqual(supermercado.longitud);
    expect(supermercadoActualizado.latitud).toEqual(supermercado.latitud);
    expect(supermercadoActualizado.paginaWeb).toEqual(supermercado.paginaWeb);

    const supermercadoAlmacenado: SupermercadoEntity =
      await repositorio.findOne({
        where: { id: supermercado.id },
      });
    expect(supermercadoAlmacenado).not.toBeNull();
    expect(supermercadoAlmacenado.nombre).toEqual(supermercado.nombre);
    expect(supermercadoAlmacenado.latitud).toEqual(supermercado.latitud);
    expect(supermercadoAlmacenado.longitud).toEqual(supermercado.longitud);
    expect(supermercadoAlmacenado.paginaWeb).toEqual(supermercado.paginaWeb);
  });

  it('update:: Debe retornar un error con un id de supermercado invalido', async () => {
    let supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado = {
      ...supermercado,
      nombre: 'Nuevo Nombre',
      latitud: '111111',
      longitud: '111111',
      paginaWeb: 'Nueva pagina web',
    };
    await expect(() =>
      service.update('0', supermercado),
    ).rejects.toHaveProperty(
      'message',
      'El supermercado con el id 0 no se encontró.',
    );
  });

  it('delete:: Debe eliminar un supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await service.delete(supermercado.id);
    const supermercadoBorrada: SupermercadoEntity = await repositorio.findOne({
      where: { id: supermercado.id },
    });
    expect(supermercadoBorrada).toBeNull();
  });

  it('delete:: Debe retornar error con una supermercado invalida por su ID', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El supermercado con el id 0 no se encontró.',
    );
  });
});
