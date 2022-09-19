import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { crearCiudadFake } from '../shared/testing-utils/entity-factories';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity';
import { CiudadService } from './ciudad.service';

describe('CiudadService', () => {
  let service: CiudadService;
  let repositorio: Repository<CiudadEntity>;
  let ciudadesList = [];

  const seedDatabase = async () => {
    ciudadesList = [];
    repositorio.clear();
    for (let i = 0; i < 5; i++) {
      const ciudad: CiudadEntity = await repositorio.save(crearCiudadFake());
      ciudadesList.push(ciudad);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadService],
    }).compile();

    service = module.get<CiudadService>(CiudadService);
    repositorio = module.get<Repository<CiudadEntity>>(
      getRepositoryToken(CiudadEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll:: debe retornar todas las ciudades', async () => {
    const ciudades: CiudadEntity[] = await service.findAll();
    expect(ciudades).not.toBeNull();
    expect(ciudades).toHaveLength(ciudadesList.length);
  });

  it('findOne:: Debe retornar una ciudad por su id', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    const ciudadEncontrada: CiudadEntity = await service.findOne(ciudad.id);
    expect(ciudadEncontrada).not.toBeNull();
    expect(ciudadEncontrada.nombre).toEqual(ciudad.nombre);
    expect(ciudadEncontrada.pais).toEqual(ciudad.pais);
    expect(ciudadEncontrada.numeroHabitantes).toEqual(ciudad.numeroHabitantes);
  });

  it('findOne:: debe retornar una excepcion con un ID invalido', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'Ciudad no encontrada',
    );
  });

  it('create:: Debe registrar una nueva ciudad', async () => {
    const nuevaCiudad: CiudadEntity = await service.create(crearCiudadFake());
    expect(nuevaCiudad).not.toBeNull();

    const ciudadAlmacenada: CiudadEntity = await repositorio.findOne({
      where: { id: nuevaCiudad.id },
    });
    expect(ciudadAlmacenada).not.toBeNull();
    expect(ciudadAlmacenada.nombre).toEqual(nuevaCiudad.nombre);
    expect(ciudadAlmacenada.pais).toEqual(nuevaCiudad.pais);
    expect(ciudadAlmacenada.numeroHabitantes).toEqual(
      nuevaCiudad.numeroHabitantes,
    );
  });

  it('update:: Debe modificar una ciudad', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.nombre = 'Nuevo Nombre';
    ciudad.pais = 'Ecuador';
    ciudad.numeroHabitantes = 600;
    const ciudadActualizada: CiudadEntity = await service.update(
      ciudad.id,
      ciudad,
    );
    expect(ciudadActualizada).not.toBeNull();
    expect(ciudadActualizada.nombre).toEqual(ciudad.nombre);
    expect(ciudadActualizada.pais).toEqual(ciudad.pais);
    expect(ciudadActualizada.numeroHabitantes).toEqual(ciudad.numeroHabitantes);

    const ciudadAlmacenada: CiudadEntity = await repositorio.findOne({
      where: { id: ciudad.id },
    });
    expect(ciudadAlmacenada).not.toBeNull();
    expect(ciudadAlmacenada.nombre).toEqual(ciudad.nombre);
    expect(ciudadAlmacenada.pais).toEqual(ciudad.pais);
    expect(ciudadAlmacenada.numeroHabitantes).toEqual(ciudad.numeroHabitantes);
  });

  it('update:: Debe retornar un error con un id de ciudad invalido', async () => {
    let ciudad: CiudadEntity = ciudadesList[0];
    ciudad = {
      ...ciudad,
      nombre: 'Nuevo Nombre',
      pais: 'Ecuador',
      numeroHabitantes: 700,
    };
    await expect(() => service.update('0', ciudad)).rejects.toHaveProperty(
      'message',
      'La ciudad con el id 0 no se encontró.',
    );
  });

  it('delete:: Debe eliminar una ciudad', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);
    const ciudadBorrada: CiudadEntity = await repositorio.findOne({
      where: { id: ciudad.id },
    });
    expect(ciudadBorrada).toBeNull();
  });

  it('delete:: Debe retornar error con una ciudad invalida por su ID', async () => {
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'La ciudad con el id 0 no se encontró.',
    );
  });
});
