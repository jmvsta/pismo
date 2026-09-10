export type AboutPageBlockType = 'TEXT' | 'PHOTO'
export type AboutPageBlockAlign = 'LEFT' | 'CENTER' | 'RIGHT'

export interface AboutPageBlock {
  id: string
  type: AboutPageBlockType
  text: string | null
  imageId: string | null
  x: number
  y: number
  width: number
  height: number
  align: AboutPageBlockAlign
}

export interface AboutPageCanvas {
  id: string
  height: number
  blocks: AboutPageBlock[]
}

export interface AboutPage {
  body: string
  canvases: AboutPageCanvas[]
  updatedAt: string
}
