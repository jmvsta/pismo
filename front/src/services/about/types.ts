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

export interface AboutPage {
  body: string
  blocks: AboutPageBlock[]
  updatedAt: string
}
