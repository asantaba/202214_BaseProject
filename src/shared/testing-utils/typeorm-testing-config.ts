import { TypeOrmModule } from '@nestjs/typeorm';
import { CiudadEntity } from '../../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../../supermercado/supermercado.entity';

const entities = [CiudadEntity, SupermercadoEntity];

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities,
    synchronize: true,
    keepConnectionAlive: true,
  }),
  TypeOrmModule.forFeature(entities),
];
