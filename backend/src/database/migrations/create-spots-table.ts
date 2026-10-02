import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpotsTable1790000000000 implements MigrationInterface {
  name = 'CreateSpotsTable1790000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await queryRunner.query(`
      CREATE TABLE spots (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        address TEXT,
        location GEOGRAPHY(POINT, 4326) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX idx_spots_location ON spots USING GIST (location)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE spots`);
  }
}
