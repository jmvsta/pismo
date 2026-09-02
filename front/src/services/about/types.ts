export interface AboutPagePhoto {
  id: string
  imageId: string
  caption: string | null
  position: number
}

export interface AboutPage {
  body: string
  photos: AboutPagePhoto[]
  updatedAt: string
}
