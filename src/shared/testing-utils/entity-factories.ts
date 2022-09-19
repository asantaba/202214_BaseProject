import { faker } from '@faker-js/faker';
import { CiudadEntity } from '../../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../../supermercado/supermercado.entity';

export const crearCiudadFake = () => {
  const nuevaCiudad: CiudadEntity = new CiudadEntity();
  nuevaCiudad.nombre = faker.lorem.sentence();
  nuevaCiudad.pais = 'Argentina';
  nuevaCiudad.numeroHabitantes = 500;
  nuevaCiudad.supermercados = [];
  return nuevaCiudad;
};

export const crearSupermercadoFake = () => {
  const nuevoSupermercado: SupermercadoEntity = new SupermercadoEntity();
  nuevoSupermercado.nombre = faker.commerce.productName();
  nuevoSupermercado.latitud = faker.lorem.sentence();
  nuevoSupermercado.longitud = faker.lorem.sentence();
  nuevoSupermercado.paginaWeb = faker.lorem.sentence();
  nuevoSupermercado.ciudades = [];
  return nuevoSupermercado;
};
