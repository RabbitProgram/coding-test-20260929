import { dataSource } from './data-source.js';

await dataSource.initialize();
const executed = await dataSource.runMigrations();
console.log(`migrations: ${executed.length} executed`);
await dataSource.destroy();
