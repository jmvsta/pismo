import type { GraphqlClient } from '../graphqlClient.ts'
import { USER_SUMMARY_FIELDS } from '../user/GraphqlUserService.ts'
import type { PenPalConnection, PenPalRequest, PenPalRequestStatus, UserMatch } from './types.ts'
import type { MatchingService } from './MatchingService.ts'

export const PEN_PAL_REQUEST_FIELDS = `
  id
  requester { ${USER_SUMMARY_FIELDS} }
  addressee { ${USER_SUMMARY_FIELDS} }
  status
  message
  createdAt
  respondedAt
`

export const PEN_PAL_CONNECTION_SUMMARY_FIELDS = `
  id
  userA { ${USER_SUMMARY_FIELDS} }
  userB { ${USER_SUMMARY_FIELDS} }
  establishedAt
  endedAt
`

const PEN_PAL_CONNECTION_FIELDS = `
  ${PEN_PAL_CONNECTION_SUMMARY_FIELDS}
  endedBy { ${USER_SUMMARY_FIELDS} }
  request {
    ${PEN_PAL_REQUEST_FIELDS}
  }
`

const MY_MATCHES_QUERY = `
  query MyMatches($limit: Int) {
    myMatches(limit: $limit) {
      userA { ${USER_SUMMARY_FIELDS} }
      userB { ${USER_SUMMARY_FIELDS} }
      score
      sharedInterests
      computedAt
    }
  }
`

const PEN_PAL_REQUESTS_QUERY = `
  query PenPalRequests($status: PenPalRequestStatus) {
    penPalRequests(status: $status) {
      ${PEN_PAL_REQUEST_FIELDS}
    }
  }
`

const MY_CONNECTIONS_QUERY = `
  query MyConnections {
    myConnections {
      ${PEN_PAL_CONNECTION_FIELDS}
    }
  }
`

const SEND_PEN_PAL_REQUEST_MUTATION = `
  mutation SendPenPalRequest($addresseeId: ID!, $message: String) {
    sendPenPalRequest(addresseeId: $addresseeId, message: $message) {
      ${PEN_PAL_REQUEST_FIELDS}
    }
  }
`

const RESPOND_TO_PEN_PAL_REQUEST_MUTATION = `
  mutation RespondToPenPalRequest($id: ID!, $accept: Boolean!) {
    respondToPenPalRequest(id: $id, accept: $accept) {
      ${PEN_PAL_REQUEST_FIELDS}
    }
  }
`

const CANCEL_PEN_PAL_REQUEST_MUTATION = `
  mutation CancelPenPalRequest($id: ID!) {
    cancelPenPalRequest(id: $id) {
      ${PEN_PAL_REQUEST_FIELDS}
    }
  }
`

const END_CONNECTION_MUTATION = `
  mutation EndConnection($id: ID!) {
    endConnection(id: $id) {
      ${PEN_PAL_CONNECTION_FIELDS}
    }
  }
`

export class GraphqlMatchingService implements MatchingService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async myMatches(limit?: number): Promise<UserMatch[]> {
    const data = await this.client.request<{ myMatches: UserMatch[] }, { limit?: number }>(
      MY_MATCHES_QUERY,
      { limit },
    )
    return data.myMatches
  }

  async penPalRequests(status?: PenPalRequestStatus): Promise<PenPalRequest[]> {
    const data = await this.client.request<
      { penPalRequests: PenPalRequest[] },
      { status?: PenPalRequestStatus }
    >(PEN_PAL_REQUESTS_QUERY, { status })
    return data.penPalRequests
  }

  async myConnections(): Promise<PenPalConnection[]> {
    const data = await this.client.request<{ myConnections: PenPalConnection[] }>(MY_CONNECTIONS_QUERY)
    return data.myConnections
  }

  async sendPenPalRequest(addresseeId: string, message?: string): Promise<PenPalRequest> {
    const data = await this.client.request<
      { sendPenPalRequest: PenPalRequest },
      { addresseeId: string; message?: string }
    >(SEND_PEN_PAL_REQUEST_MUTATION, { addresseeId, message })
    return data.sendPenPalRequest
  }

  async respondToPenPalRequest(id: string, accept: boolean): Promise<PenPalRequest> {
    const data = await this.client.request<
      { respondToPenPalRequest: PenPalRequest },
      { id: string; accept: boolean }
    >(RESPOND_TO_PEN_PAL_REQUEST_MUTATION, { id, accept })
    return data.respondToPenPalRequest
  }

  async cancelPenPalRequest(id: string): Promise<PenPalRequest> {
    const data = await this.client.request<{ cancelPenPalRequest: PenPalRequest }, { id: string }>(
      CANCEL_PEN_PAL_REQUEST_MUTATION,
      { id },
    )
    return data.cancelPenPalRequest
  }

  async endConnection(id: string): Promise<PenPalConnection> {
    const data = await this.client.request<{ endConnection: PenPalConnection }, { id: string }>(
      END_CONNECTION_MUTATION,
      { id },
    )
    return data.endConnection
  }
}
