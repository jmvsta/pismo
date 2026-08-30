import { API_BASE_URL } from '../config/env.ts'

export function imageUrl(imageId: string | null | undefined): string | null {
  return imageId ? `${API_BASE_URL}/images/${imageId}` : null
}
