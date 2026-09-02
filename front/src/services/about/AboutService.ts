import type { AboutPage } from './types.ts'

export interface AboutService {
  aboutPage(): Promise<AboutPage>
  updateBody(body: string): Promise<AboutPage>
  addPhoto(mimeType: string, imageBase64: string, caption?: string): Promise<AboutPage>
  removePhoto(id: string): Promise<AboutPage>
}
