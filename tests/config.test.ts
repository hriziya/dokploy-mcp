import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { normalizeUrl, resolveConfig } from '../src/config/resolver.js'
import { getConfigDir, getConfigFilePath } from '../src/config/types.js'

describe('normalizeUrl', () => {
  it('adds /api/trpc to bare URL', () => {
    expect(normalizeUrl('https://panel.example.com')).toBe('https://panel.example.com/api/trpc')
  })

  it('adds /trpc to /api URL', () => {
    expect(normalizeUrl('https://panel.example.com/api')).toBe('https://panel.example.com/api/trpc')
  })

  it('returns /api/trpc URL unchanged', () => {
    expect(normalizeUrl('https://panel.example.com/api/trpc')).toBe(
      'https://panel.example.com/api/trpc',
    )
  })

  it('strips trailing slashes', () => {
    expect(normalizeUrl('https://panel.example.com/')).toBe('https://panel.example.com/api/trpc')
    expect(normalizeUrl('https://panel.example.com///')).toBe('https://panel.example.com/api/trpc')
  })

  it('handles /api/ with trailing slash', () => {
    expect(normalizeUrl('https://panel.example.com/api/')).toBe(
      'https://panel.example.com/api/trpc',
    )
  })

  it('handles /api/trpc/ with trailing slash', () => {
    expect(normalizeUrl('https://panel.example.com/api/trpc/')).toBe(
      'https://panel.example.com/api/trpc',
    )
  })

  it('handles URL with port', () => {
    expect(normalizeUrl('https://panel.example.com:3000')).toBe(
      'https://panel.example.com:3000/api/trpc',
    )
  })

  it('handles URL with port and /api', () => {
    expect(normalizeUrl('https://panel.example.com:3000/api')).toBe(
      'https://panel.example.com:3000/api/trpc',
    )
  })
})

describe('resolveConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    // Clear any existing dokploy env vars from the test runner
    process.env.DOKPLOY_URL = undefined
    process.env.DOKPLOY_API_KEY = undefined
    process.env.DOKPLOY_TIMEOUT = undefined
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('resolves from env vars when both are set', () => {
    process.env.DOKPLOY_URL = 'https://test.example.com'
    process.env.DOKPLOY_API_KEY = 'test-key-123'

    const config = resolveConfig()

    expect(config).not.toBeNull()
    expect(config!.url).toBe('https://test.example.com/api/trpc')
    expect(config!.apiKey).toBe('test-key-123')
    expect(config!.source).toBe('env')
  })

  it('uses default timeout of 30000', () => {
    process.env.DOKPLOY_URL = 'https://test.example.com'
    process.env.DOKPLOY_API_KEY = 'test-key-123'

    const config = resolveConfig()
    expect(config!.timeout).toBe(30000)
  })

  it('respects custom DOKPLOY_TIMEOUT', () => {
    process.env.DOKPLOY_URL = 'https://test.example.com'
    process.env.DOKPLOY_API_KEY = 'test-key-123'
    process.env.DOKPLOY_TIMEOUT = '60000'

    const config = resolveConfig()
    expect(config!.timeout).toBe(60000)
  })

  it('returns null when only URL is set', () => {
    process.env.DOKPLOY_URL = 'https://test.example.com'
    // DOKPLOY_API_KEY is not set

    const config = resolveConfig()
    // May or may not be null depending on config file existence,
    // but won't resolve from env source
    if (config) {
      expect(config.source).not.toBe('env')
    }
  })

  it('returns null when only API key is set', () => {
    process.env.DOKPLOY_API_KEY = 'test-key-123'
    // DOKPLOY_URL is not set

    const config = resolveConfig()
    if (config) {
      expect(config.source).not.toBe('env')
    }
  })

  it('normalizes URL from env vars', () => {
    process.env.DOKPLOY_URL = 'https://panel.example.com/api'
    process.env.DOKPLOY_API_KEY = 'key'

    const config = resolveConfig()
    expect(config!.url).toBe('https://panel.example.com/api/trpc')
  })
})

describe('getConfigDir', () => {
  it('returns a non-empty string', () => {
    const dir = getConfigDir()
    expect(dir).toBeTruthy()
    expect(typeof dir).toBe('string')
  })

  it('ends with dokploy-mcp', () => {
    const dir = getConfigDir()
    expect(dir.endsWith('dokploy-mcp')).toBe(true)
  })
})

describe('getConfigFilePath', () => {
  it('returns a path ending with config.json', () => {
    const path = getConfigFilePath()
    expect(path.endsWith('config.json')).toBe(true)
  })

  it('contains the config dir', () => {
    const dir = getConfigDir()
    const path = getConfigFilePath()
    expect(path.startsWith(dir)).toBe(true)
  })
})
