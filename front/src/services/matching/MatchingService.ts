import type { PenPalConnection, PenPalRequest, PenPalRequestStatus, UserMatch } from './types.ts'

export interface MatchingService {
  myMatches(limit?: number): Promise<UserMatch[]>
  penPalRequests(status?: PenPalRequestStatus): Promise<PenPalRequest[]>
  myConnections(): Promise<PenPalConnection[]>
  sendPenPalRequest(addresseeId: string, message?: string): Promise<PenPalRequest>
  respondToPenPalRequest(id: string, accept: boolean): Promise<PenPalRequest>
  cancelPenPalRequest(id: string): Promise<PenPalRequest>
  endConnection(id: string): Promise<PenPalConnection>
}
