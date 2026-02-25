import { z } from 'zod'

import { createDatabaseTools } from './_database.js'

export const postgresTools = createDatabaseTools({
  type: 'postgres',
  idField: 'postgresId',
  displayName: 'Postgres',
  defaultImage: 'postgres:15',
  createFields: z.object({
    databaseName: z.string().min(1).describe('Name of the database to create'),
    databaseUser: z.string().min(1).describe('Database user'),
    databasePassword: z.string().min(1).describe('Database password'),
  }),
})
