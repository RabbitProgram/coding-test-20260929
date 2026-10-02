import { readFileSync } from 'node:fs';
import { dataSource } from './data-source.js';
import { parseSpotSeeds } from './seed-loader.js';
import { Spot } from '../spots/spot.entity.js';

const SEED_FILE = `${import.meta.dirname}/../../seeds/seed.csv`;

const spots = parseSpotSeeds(readFileSync(SEED_FILE));

await dataSource.initialize();
await dataSource.getRepository(Spot).upsert(spots, ['name']);
console.log(`seed: ${spots.length} spots upserted from seeds/seed.csv`);
await dataSource.destroy();
