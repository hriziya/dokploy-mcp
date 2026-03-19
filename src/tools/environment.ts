import { z } from 'zod'
import { getTool, postTool, type ToolDefinition } from './_factory.js'

// ── tools ────────────────────────────────────────────────────────────

const one = getTool({
  name: 'dokploy_environment_one',
  title: 'Get Environment',
  description:
    'Retrieve detailed information about a specific environment by its unique ID. Returns the environment object including its name, description, and associated services (applications, databases, compose stacks). Use the environmentId from project.one response to look up environments.',
  schema: z
    .object({
      environmentId: z.string().min(1).describe('The unique environment ID'),
    })
    .strict(),
  endpoint: '/environment.one',
})

const create = postTool({
  name: 'dokploy_environment_create',
  title: 'Create Environment',
  description:
    'Create a new environment within a Dokploy project. Environments are containers for services (applications, databases, compose stacks). Each project starts with a default environment, but you can create additional ones for staging, testing, etc. Requires the project ID and a name.',
  schema: z
    .object({
      projectId: z.string().min(1).describe('The project ID to create the environment in'),
      name: z.string().min(1).describe('The name of the environment'),
      description: z.string().optional().describe('Optional environment description'),
    })
    .strict(),
  endpoint: '/environment.create',
})

const update = postTool({
  name: 'dokploy_environment_update',
  title: 'Update Environment',
  description:
    'Update an existing environment configuration. Requires the environment ID and accepts optional fields to modify including name, description, and environment variables.',
  schema: z
    .object({
      environmentId: z.string().min(1).describe('The unique environment ID'),
      name: z.string().optional().describe('New environment name'),
      description: z.string().optional().describe('New environment description'),
      env: z.string().optional().describe('Environment variables'),
    })
    .strict(),
  endpoint: '/environment.update',
})

const remove = postTool({
  name: 'dokploy_environment_remove',
  title: 'Remove Environment',
  description:
    'Permanently remove an environment and all its associated services (applications, databases, compose stacks). This action is irreversible. Requires the environment ID.',
  schema: z
    .object({
      environmentId: z.string().min(1).describe('The unique environment ID to remove'),
    })
    .strict(),
  endpoint: '/environment.remove',
  annotations: { destructiveHint: true },
})

// ── export ───────────────────────────────────────────────────────────
export const environmentTools: ToolDefinition[] = [one, create, update, remove]
