import { DataSource, type DataSourceOptions } from 'typeorm';
import { Spot } from '../spots/spot.entity.js';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'app',
  password: process.env.POSTGRES_PASSWORD ?? 'app',
  database: process.env.POSTGRES_DB ?? 'app',
  entities: [Spot],
  migrations: [`${import.meta.dirname}/migrations/*.js`],
  synchronize: false,
};

export const dataSource = new DataSource(dataSourceOptions);
