import {
  Table,
  TableIndex,
  type MigrationInterface,
  type QueryRunner,
} from 'typeorm';

export class CreateSpotsTable1790000000000 implements MigrationInterface {
  name = 'CreateSpotsTable1790000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.createTable(
      new Table({
        name: 'spots',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            generatedIdentity: 'ALWAYS',
          },
          { name: 'name', type: 'text', isUnique: true },
          { name: 'category', type: 'text' },
          { name: 'address', type: 'text', isNullable: true },
          {
            name: 'location',
            type: 'geography',
            spatialFeatureType: 'Point',
            srid: 4326,
          },
        ],
        indices: [
          new TableIndex({
            name: 'idx_spots_location',
            columnNames: ['location'],
            isSpatial: true,
          }),
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('spots');
  }
}
