export type AboutPageBlockType = 'TEXT' | 'PHOTO' | 'BUTTON' | 'GALLERY'
export type AboutPageBlockAlign = 'LEFT' | 'CENTER' | 'RIGHT'
export type AboutPageLanguage = 'EN' | 'RU' | 'SRB'
export type AboutPageMoveDirection = 'UP' | 'DOWN'

export interface AboutPageBlock {
  id: string
  type: AboutPageBlockType
  textEn: string | null
  textRu: string | null
  textSrb: string | null
  imageId: string | null
  linkUrl: string | null
  galleryImageIds: string[]
  slideIntervalSeconds: number | null
  x: number
  y: number
  width: number
  height: number
  align: AboutPageBlockAlign
  layer: number
  rounded: boolean
  highlighted: boolean
  icon: string | null
  fontSize: number | null
  fontFamily: string | null
}

export interface AboutPageCanvas {
  id: string
  height: number
  backgroundImageId: string | null
  rounded: boolean
  bordered: boolean
  blocks: AboutPageBlock[]
}

export interface AboutPage {
  canvases: AboutPageCanvas[]
  updatedAt: string
}

export function pickTranslation(en: string, ru: string | null, srb: string | null, language: AboutPageLanguage): string {
  if (language === 'RU') return ru || en
  if (language === 'SRB') return srb || en
  return en
}
