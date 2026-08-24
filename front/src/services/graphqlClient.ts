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

const DEFAULT_ENDPOINT = 'http://localhost:8080/graphql'

interface GraphqlResponseBody<TData> {
  data?: TData
  errors?: GraphqlError[]
}

export class GraphqlClient {
  private readonly endpoint: string

  constructor(endpoint: string = import.meta.env.VITE_GRAPHQL_URL ?? DEFAULT_ENDPOINT) {
    this.endpoint = endpoint
  }

  async request<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
    query: string,
    variables?: TVariables,
  ): Promise<TData> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
