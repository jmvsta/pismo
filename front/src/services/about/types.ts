export type AboutPageBlockType = 'TEXT' | 'PHOTO' | 'BUTTON'
export type AboutPageBlockAlign = 'LEFT' | 'CENTER' | 'RIGHT'

export interface AboutPageBlock {
  id: string
  type: AboutPageBlockType
  text: string | null
  imageId: string | null
  linkUrl: string | null
  x: number
  y: number
  width: number
  height: number
  align: AboutPageBlockAlign
}

export interface AboutPageCanvas {
  id: string
  height: number
  backgroundImageId: string | null
  blocks: AboutPageBlock[]
}

export interface AboutPage {
  body: string
  canvases: AboutPageCanvas[]
  updatedAt: string
}
