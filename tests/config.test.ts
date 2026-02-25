import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { normalizeUrl } from '../src/config/resolver.js'

describe('normalizeUrl', () => {
  it('adds /api/trpc to bare URL', () => {
    expect(normalizeUrl('https://panel.example.com')).toBe('https://panel.example.com/api/trpc')
  })

  it('adds /trpc to /api URL', () => {
    expect(normalizeUrl('https://panel.example.com/api')).toBe('https://panel.example.com/api/trpc')
  })

  it('returns /api/trpc URL unchanged', () => {
    const url = 'https://panel.example.com/api/trpc'
    expect(normalizeUrl(url)).toBe('https://panel.example.com/api/trpc')
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
})

describe('resolveConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('resolves from env vars when both are set', async () => {
    process.env.DOKPLOY_URL = 'https://test.example.com'
    process.env.DOKPLOY_API_KEY = 'test-key-123'

    // Dynamic import to get fresh evaluation of process.env
    const { resolveConfig } = await import('../src/config/resolver.js')
    const config = resolveConfig()

    // resolveConfig reads process.env directly each time it's called
    expect(config).not.toBeNull()
    if (config) {
      expect(config.url).toBe('https://test.example.com/api/trpc')
      expect(config.apiKey).toBe('test-key-123')
      expect(config.source).toBe('env')
    }
  })
})
