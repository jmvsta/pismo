import type { AboutPage, AboutPageBlockAlign } from './types.ts'

export interface AboutService {
  aboutPage(): Promise<AboutPage>
  updateBody(body: string): Promise<AboutPage>
  addCanvas(): Promise<AboutPage>
  updateCanvasHeight(id: string, height: number): Promise<AboutPage>
  updateCanvasBackground(id: string, mimeType: string, imageBase64: string): Promise<AboutPage>
  removeCanvasBackground(id: string): Promise<AboutPage>
  removeCanvas(id: string): Promise<AboutPage>
  addTextBlock(
    canvasId: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<AboutPage>
  addPhotoBlock(
    canvasId: string,
    mimeType: string,
    imageBase64: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<AboutPage>
  addButtonBlock(
    canvasId: string,
    text: string,
    linkUrl: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<AboutPage>
  updateBlockLayout(id: string, x: number, y: number, width: number, height: number): Promise<AboutPage>
  updateBlockAlign(id: string, align: AboutPageBlockAlign): Promise<AboutPage>
  updateBlockText(id: string, text: string): Promise<AboutPage>
  updateBlockLink(id: string, linkUrl: string): Promise<AboutPage>
  removeBlock(id: string): Promise<AboutPage>
}
