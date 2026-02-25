import { z } from 'zod'

import { createDatabaseTools } from './_database.js'

export const mongoTools = createDatabaseTools({
  type: 'mongo',
  idField: 'mongoId',
  displayName: 'MongoDB',
  defaultImage: 'mongo:6',
  createFields: z.object({
    databaseUser: z.string().min(1).describe('Database user'),
    databasePassword: z.string().min(1).describe('Database password'),
  }),
})
