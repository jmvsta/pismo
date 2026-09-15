export type AboutPageBlockType = 'TEXT' | 'PHOTO' | 'BUTTON'
export type AboutPageBlockAlign = 'LEFT' | 'CENTER' | 'RIGHT'
export type AboutPageLanguage = 'EN' | 'RU' | 'SRB'

export interface AboutPageBlock {
  id: string
  type: AboutPageBlockType
  textEn: string | null
  textRu: string | null
  textSrb: string | null
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
  bodyEn: string
  bodyRu: string | null
  bodySrb: string | null
  canvases: AboutPageCanvas[]
  updatedAt: string
}

export function pickTranslation(en: string, ru: string | null, srb: string | null, language: AboutPageLanguage): string {
  if (language === 'RU') return ru || en
  if (language === 'SRB') return srb || en
  return en
}
