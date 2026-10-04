import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Point } from 'geojson';

@Entity('spots')
export class Spot {
  @PrimaryGeneratedColumn('identity', {
    type: 'bigint',
    generatedIdentity: 'ALWAYS',
  })
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column('text')
  category: string;

  @Column('text', { nullable: true })
  address: string | null;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
  location: Point;
}
