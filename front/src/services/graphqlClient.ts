import { API_BASE_URL } from '../config/env.ts'

const AUTH_TOKEN_STORAGE_KEY = 'pismo_auth_token'

export interface GraphqlError {
  message: string
}

export class GraphqlRequestError extends Error {
  readonly errors: GraphqlError[]

  constructor(errors: GraphqlError[]) {
    super(errors.map((error) => error.message).join('; '))
    this.errors = errors
  }
}

interface GraphqlResponseBody<TData> {
  data?: TData
  errors?: GraphqlError[]
}

export class GraphqlClient {
  private readonly endpoint: string
  private authToken: string | null

  constructor(endpoint: string = `${API_BASE_URL}/graphql`) {
    this.endpoint = endpoint
    this.authToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  }

  setAuthToken(token: string | null): void {
    this.authToken = token
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    }
  }

  getAuthToken(): string | null {
    return this.authToken
  }

  async request<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
    query: string,
    variables?: TVariables,
  ): Promise<TData> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`)
    }

    const body = (await response.json()) as GraphqlResponseBody<TData>

    if (body.errors?.length) {
      throw new GraphqlRequestError(body.errors)
    }

    return body.data as TData
  }
}

export const graphqlClient = new GraphqlClient()
