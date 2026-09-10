import type { AboutPage, AboutPageBlockAlign } from './types.ts'

export interface AboutService {
  aboutPage(): Promise<AboutPage>
  updateBody(body: string): Promise<AboutPage>
  addTextBlock(text: string, x: number, y: number, width: number, height: number): Promise<AboutPage>
  addPhotoBlock(
    mimeType: string,
    imageBase64: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<AboutPage>
  updateBlockLayout(id: string, x: number, y: number, width: number, height: number): Promise<AboutPage>
  updateBlockAlign(id: string, align: AboutPageBlockAlign): Promise<AboutPage>
  updateBlockText(id: string, text: string): Promise<AboutPage>
  removeBlock(id: string): Promise<AboutPage>
}
