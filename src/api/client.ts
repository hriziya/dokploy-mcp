interface ClientConfig {
  baseUrl: string
  apiKey: string
  timeout: number
}

function getConfig(): ClientConfig {
  const baseUrl = process.env.DOKPLOY_URL
  const apiKey = process.env.DOKPLOY_API_KEY

  if (!baseUrl) {
    throw new Error(
      'DOKPLOY_URL environment variable is required. Set it to your Dokploy instance URL (e.g., https://dokploy.example.com/api)',
    )
  }
  if (!apiKey) {
    throw new Error(
      'DOKPLOY_API_KEY environment variable is required. Generate one in Dokploy Settings > API.',
    )
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiKey,
    timeout: Number.parseInt(process.env.DOKPLOY_TIMEOUT || '30000', 10),
  }
}

let _config: ClientConfig | null = null
function config(): ClientConfig {
  _config ??= getConfig()
  return _config
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    public readonly endpoint: string,
  ) {
    const msg =
      typeof body === 'object' && body !== null && 'message' in body
        ? (body as { message: string }).message
        : statusText
    super(`Dokploy API error (${status}): ${msg}`)
    this.name = 'ApiError'
  }
}

function buildQueryString(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return ''
  }
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (v !== undefined && v !== null) {
      params.set(k, String(v))
    }
  }
  return params.toString()
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException || (error instanceof Error && error.name === 'AbortError')
}

async function request<T = unknown>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const { baseUrl, apiKey, timeout } = config()

  const qs = method === 'GET' ? buildQueryString(body) : ''
  const url = qs ? `${baseUrl}${path}?${qs}` : `${baseUrl}${path}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-api-key': apiKey,
      },
      body: method === 'POST' && body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const text = await response.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, data, path)
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (isAbortError(error)) {
      throw new Error(`Request to ${path} timed out after ${timeout}ms`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  get: <T = unknown>(path: string, params?: Record<string, unknown>) =>
    request<T>('GET', path, params),
  post: <T = unknown>(path: string, body?: unknown) => request<T>('POST', path, body),
}
