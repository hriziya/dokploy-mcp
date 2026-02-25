import { describe, expect, it } from 'vitest'
import { ApiError } from '../src/api/client.js'

describe('ApiError', () => {
  it('extracts message from body object', () => {
    const err = new ApiError(400, 'Bad Request', { message: 'Invalid input' }, 'test.endpoint')
    expect(err.message).toBe('Dokploy API error (400): Invalid input')
    expect(err.status).toBe(400)
    expect(err.statusText).toBe('Bad Request')
    expect(err.endpoint).toBe('test.endpoint')
    expect(err.name).toBe('ApiError')
  })

  it('falls back to statusText when body has no message', () => {
    const err = new ApiError(500, 'Internal Server Error', null, 'test.endpoint')
    expect(err.message).toBe('Dokploy API error (500): Internal Server Error')
  })

  it('falls back to statusText for non-object body', () => {
    const err = new ApiError(502, 'Bad Gateway', 'raw text', 'test.endpoint')
    expect(err.message).toBe('Dokploy API error (502): Bad Gateway')
  })

  it('handles body object without message property', () => {
    const err = new ApiError(422, 'Unprocessable', { errors: ['field required'] }, 'test.create')
    expect(err.message).toBe('Dokploy API error (422): Unprocessable')
    expect(err.body).toEqual({ errors: ['field required'] })
  })

  it('is instanceof Error', () => {
    const err = new ApiError(404, 'Not Found', null, 'test.one')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ApiError)
  })

  it('preserves body for downstream inspection', () => {
    const body = { code: 'VALIDATION', fields: { name: 'required' } }
    const err = new ApiError(422, 'Unprocessable', body, 'test.create')
    expect(err.body).toBe(body)
  })
})
