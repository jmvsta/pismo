import type { PenPalConnection, PenPalRequest, PenPalRequestStatus, SuggestedProfile, UserMatch } from './types.ts'

export interface MatchingService {
  myMatches(limit?: number): Promise<UserMatch[]>
  suggestedProfiles(search?: string, limit?: number, offset?: number): Promise<SuggestedProfile[]>
  penPalRequests(status?: PenPalRequestStatus): Promise<PenPalRequest[]>
  myConnections(): Promise<PenPalConnection[]>
  sendPenPalRequest(addresseeId: string, message?: string): Promise<PenPalRequest>
  respondToPenPalRequest(id: string, accept: boolean): Promise<PenPalRequest>
  cancelPenPalRequest(id: string): Promise<PenPalRequest>
  endConnection(id: string): Promise<PenPalConnection>
  hideProfile(userId: string): Promise<void>
}
