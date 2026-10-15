import type { AboutPage, AboutPageBlockAlign, AboutPageLanguage, AboutPageMoveDirection } from './types.ts'

export interface AboutService {
  aboutPage(): Promise<AboutPage>
  addCanvas(): Promise<AboutPage>
  moveCanvas(id: string, direction: AboutPageMoveDirection): Promise<AboutPage>
  updateCanvasHeight(id: string, height: number): Promise<AboutPage>
  updateCanvasRounded(id: string, rounded: boolean): Promise<AboutPage>
  updateBlockRounded(id: string, rounded: boolean): Promise<AboutPage>
  updateCanvasBordered(id: string, bordered: boolean): Promise<AboutPage>
  updateBlockHighlighted(id: string, highlighted: boolean): Promise<AboutPage>
  updateBlockIcon(id: string, icon: string | null): Promise<AboutPage>
  updateBlockFont(id: string, fontSize: number | null, fontFamily: string | null): Promise<AboutPage>
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
  addGalleryBlock(
    canvasId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    slideIntervalSeconds: number,
  ): Promise<AboutPage>
  addGalleryPhoto(blockId: string, mimeType: string, imageBase64: string): Promise<AboutPage>
  removeGalleryPhoto(blockId: string, imageId: string): Promise<AboutPage>
  updateGalleryInterval(id: string, slideIntervalSeconds: number): Promise<AboutPage>
  copyBlock(blockId: string, canvasId: string): Promise<AboutPage>
  updateBlockLayout(id: string, x: number, y: number, width: number, height: number): Promise<AboutPage>
  updateBlockAlign(id: string, align: AboutPageBlockAlign): Promise<AboutPage>
  updateBlockLayer(id: string, layer: number): Promise<AboutPage>
  updateBlockText(id: string, text: string, language: AboutPageLanguage): Promise<AboutPage>
  updateBlockLink(id: string, linkUrl: string): Promise<AboutPage>
  removeBlock(id: string): Promise<AboutPage>
}
