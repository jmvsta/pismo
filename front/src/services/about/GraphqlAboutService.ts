import type { GraphqlClient } from '../graphqlClient.ts'
import type { AboutPage, AboutPageBlockAlign, AboutPageLanguage, AboutPageMoveDirection } from './types.ts'
import type { AboutService } from './AboutService.ts'

const ABOUT_PAGE_FIELDS = `
  updatedAt
  canvases {
    id
    height
    backgroundImageId
    rounded
    bordered
    blocks {
      id
      type
      textEn
      textRu
      textSrb
      imageId
      linkUrl
      galleryImageIds
      slideIntervalSeconds
      x
      y
      width
      height
      align
      layer
      rounded
      highlighted
      icon
      fontSize
      fontFamily
    }
  }
`

const ABOUT_PAGE_QUERY = `
  query AboutPage {
    aboutPage {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const ADD_ABOUT_PAGE_CANVAS_MUTATION = `
  mutation AddAboutPageCanvas {
    addAboutPageCanvas {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const MOVE_ABOUT_PAGE_CANVAS_MUTATION = `
  mutation MoveAboutPageCanvas($id: ID!, $direction: AboutPageMoveDirection!) {
    moveAboutPageCanvas(id: $id, direction: $direction) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_CANVAS_HEIGHT_MUTATION = `
  mutation UpdateAboutPageCanvasHeight($id: ID!, $height: Float!) {
    updateAboutPageCanvasHeight(id: $id, height: $height) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_CANVAS_ROUNDED_MUTATION = `
  mutation UpdateAboutPageCanvasRounded($id: ID!, $rounded: Boolean!) {
    updateAboutPageCanvasRounded(id: $id, rounded: $rounded) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_BLOCK_ROUNDED_MUTATION = `
  mutation UpdateAboutPageBlockRounded($id: ID!, $rounded: Boolean!) {
    updateAboutPageBlockRounded(id: $id, rounded: $rounded) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_CANVAS_BORDERED_MUTATION = `
  mutation UpdateAboutPageCanvasBordered($id: ID!, $bordered: Boolean!) {
    updateAboutPageCanvasBordered(id: $id, bordered: $bordered) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_BLOCK_HIGHLIGHTED_MUTATION = `
  mutation UpdateAboutPageBlockHighlighted($id: ID!, $highlighted: Boolean!) {
    updateAboutPageBlockHighlighted(id: $id, highlighted: $highlighted) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_BLOCK_ICON_MUTATION = `
  mutation UpdateAboutPageBlockIcon($id: ID!, $icon: String) {
    updateAboutPageBlockIcon(id: $id, icon: $icon) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_BLOCK_FONT_MUTATION = `
  mutation UpdateAboutPageBlockFont($id: ID!, $fontSize: Float, $fontFamily: String) {
    updateAboutPageBlockFont(id: $id, fontSize: $fontSize, fontFamily: $fontFamily) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_CANVAS_BACKGROUND_MUTATION = `
  mutation UpdateAboutPageCanvasBackground($id: ID!, $mimeType: String!, $imageBase64: String!) {
    updateAboutPageCanvasBackground(id: $id, mimeType: $mimeType, imageBase64: $imageBase64) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const REMOVE_ABOUT_PAGE_CANVAS_BACKGROUND_MUTATION = `
  mutation RemoveAboutPageCanvasBackground($id: ID!) {
    removeAboutPageCanvasBackground(id: $id) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const REMOVE_ABOUT_PAGE_CANVAS_MUTATION = `
  mutation RemoveAboutPageCanvas($id: ID!) {
    removeAboutPageCanvas(id: $id) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const ADD_ABOUT_PAGE_TEXT_BLOCK_MUTATION = `
  mutation AddAboutPageTextBlock(
    $canvasId: ID!
    $text: String!
    $x: Float!
    $y: Float!
    $width: Float!
    $height: Float!
  ) {
    addAboutPageTextBlock(canvasId: $canvasId, text: $text, x: $x, y: $y, width: $width, height: $height) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const ADD_ABOUT_PAGE_PHOTO_BLOCK_MUTATION = `
  mutation AddAboutPagePhotoBlock(
    $canvasId: ID!
    $mimeType: String!
    $imageBase64: String!
    $x: Float!
    $y: Float!
    $width: Float!
    $height: Float!
  ) {
    addAboutPagePhotoBlock(
      canvasId: $canvasId
      mimeType: $mimeType
      imageBase64: $imageBase64
      x: $x
      y: $y
      width: $width
      height: $height
    ) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const ADD_ABOUT_PAGE_BUTTON_BLOCK_MUTATION = `
  mutation AddAboutPageButtonBlock(
    $canvasId: ID!
    $text: String!
    $linkUrl: String!
    $x: Float!
    $y: Float!
    $width: Float!
    $height: Float!
  ) {
    addAboutPageButtonBlock(
      canvasId: $canvasId
      text: $text
      linkUrl: $linkUrl
      x: $x
      y: $y
      width: $width
      height: $height
    ) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const ADD_ABOUT_PAGE_GALLERY_BLOCK_MUTATION = `
  mutation AddAboutPageGalleryBlock(
    $canvasId: ID!
    $x: Float!
    $y: Float!
    $width: Float!
    $height: Float!
    $slideIntervalSeconds: Float!
  ) {
    addAboutPageGalleryBlock(
      canvasId: $canvasId
      x: $x
      y: $y
      width: $width
      height: $height
      slideIntervalSeconds: $slideIntervalSeconds
    ) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const ADD_ABOUT_PAGE_GALLERY_PHOTO_MUTATION = `
  mutation AddAboutPageGalleryPhoto($blockId: ID!, $mimeType: String!, $imageBase64: String!) {
    addAboutPageGalleryPhoto(blockId: $blockId, mimeType: $mimeType, imageBase64: $imageBase64) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const REMOVE_ABOUT_PAGE_GALLERY_PHOTO_MUTATION = `
  mutation RemoveAboutPageGalleryPhoto($blockId: ID!, $imageId: ID!) {
    removeAboutPageGalleryPhoto(blockId: $blockId, imageId: $imageId) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_GALLERY_INTERVAL_MUTATION = `
  mutation UpdateAboutPageGalleryInterval($id: ID!, $slideIntervalSeconds: Float!) {
    updateAboutPageGalleryInterval(id: $id, slideIntervalSeconds: $slideIntervalSeconds) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const COPY_ABOUT_PAGE_BLOCK_MUTATION = `
  mutation CopyAboutPageBlock($blockId: ID!, $canvasId: ID!) {
    copyAboutPageBlock(blockId: $blockId, canvasId: $canvasId) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_BLOCK_LAYOUT_MUTATION = `
  mutation UpdateAboutPageBlockLayout($id: ID!, $x: Float!, $y: Float!, $width: Float!, $height: Float!) {
    updateAboutPageBlockLayout(id: $id, x: $x, y: $y, width: $width, height: $height) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_BLOCK_ALIGN_MUTATION = `
  mutation UpdateAboutPageBlockAlign($id: ID!, $align: AboutPageBlockAlign!) {
    updateAboutPageBlockAlign(id: $id, align: $align) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_BLOCK_LAYER_MUTATION = `
  mutation UpdateAboutPageBlockLayer($id: ID!, $layer: Int!) {
    updateAboutPageBlockLayer(id: $id, layer: $layer) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_BLOCK_TEXT_MUTATION = `
  mutation UpdateAboutPageBlockText($id: ID!, $text: String!, $language: AboutPageLanguage!) {
    updateAboutPageBlockText(id: $id, text: $text, language: $language) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const UPDATE_ABOUT_PAGE_BLOCK_LINK_MUTATION = `
  mutation UpdateAboutPageBlockLink($id: ID!, $linkUrl: String!) {
    updateAboutPageBlockLink(id: $id, linkUrl: $linkUrl) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const REMOVE_ABOUT_PAGE_BLOCK_MUTATION = `
  mutation RemoveAboutPageBlock($id: ID!) {
    removeAboutPageBlock(id: $id) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

export class GraphqlAboutService implements AboutService {
  private readonly client: GraphqlClient

  constructor(client: GraphqlClient) {
    this.client = client
  }

  async aboutPage(): Promise<AboutPage> {
    const data = await this.client.request<{ aboutPage: AboutPage }>(ABOUT_PAGE_QUERY)
    return data.aboutPage
  }

  async addCanvas(): Promise<AboutPage> {
    const data = await this.client.request<{ addAboutPageCanvas: AboutPage }>(ADD_ABOUT_PAGE_CANVAS_MUTATION)
    return data.addAboutPageCanvas
  }

  async moveCanvas(id: string, direction: AboutPageMoveDirection): Promise<AboutPage> {
    const data = await this.client.request<
      { moveAboutPageCanvas: AboutPage },
      { id: string; direction: AboutPageMoveDirection }
    >(MOVE_ABOUT_PAGE_CANVAS_MUTATION, { id, direction })
    return data.moveAboutPageCanvas
  }

  async updateCanvasHeight(id: string, height: number): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageCanvasHeight: AboutPage },
      { id: string; height: number }
    >(UPDATE_ABOUT_PAGE_CANVAS_HEIGHT_MUTATION, { id, height })
    return data.updateAboutPageCanvasHeight
  }

  async updateCanvasRounded(id: string, rounded: boolean): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageCanvasRounded: AboutPage },
      { id: string; rounded: boolean }
    >(UPDATE_ABOUT_PAGE_CANVAS_ROUNDED_MUTATION, { id, rounded })
    return data.updateAboutPageCanvasRounded
  }

  async updateBlockRounded(id: string, rounded: boolean): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockRounded: AboutPage },
      { id: string; rounded: boolean }
    >(UPDATE_ABOUT_PAGE_BLOCK_ROUNDED_MUTATION, { id, rounded })
    return data.updateAboutPageBlockRounded
  }

  async updateCanvasBordered(id: string, bordered: boolean): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageCanvasBordered: AboutPage },
      { id: string; bordered: boolean }
    >(UPDATE_ABOUT_PAGE_CANVAS_BORDERED_MUTATION, { id, bordered })
    return data.updateAboutPageCanvasBordered
  }

  async updateBlockHighlighted(id: string, highlighted: boolean): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockHighlighted: AboutPage },
      { id: string; highlighted: boolean }
    >(UPDATE_ABOUT_PAGE_BLOCK_HIGHLIGHTED_MUTATION, { id, highlighted })
    return data.updateAboutPageBlockHighlighted
  }

  async updateBlockIcon(id: string, icon: string | null): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockIcon: AboutPage },
      { id: string; icon: string | null }
    >(UPDATE_ABOUT_PAGE_BLOCK_ICON_MUTATION, { id, icon })
    return data.updateAboutPageBlockIcon
  }

  async updateBlockFont(id: string, fontSize: number | null, fontFamily: string | null): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockFont: AboutPage },
      { id: string; fontSize: number | null; fontFamily: string | null }
    >(UPDATE_ABOUT_PAGE_BLOCK_FONT_MUTATION, { id, fontSize, fontFamily })
    return data.updateAboutPageBlockFont
  }

  async updateCanvasBackground(id: string, mimeType: string, imageBase64: string): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageCanvasBackground: AboutPage },
      { id: string; mimeType: string; imageBase64: string }
    >(UPDATE_ABOUT_PAGE_CANVAS_BACKGROUND_MUTATION, { id, mimeType, imageBase64 })
    return data.updateAboutPageCanvasBackground
  }

  async removeCanvasBackground(id: string): Promise<AboutPage> {
    const data = await this.client.request<{ removeAboutPageCanvasBackground: AboutPage }, { id: string }>(
      REMOVE_ABOUT_PAGE_CANVAS_BACKGROUND_MUTATION,
      { id },
    )
    return data.removeAboutPageCanvasBackground
  }

  async removeCanvas(id: string): Promise<AboutPage> {
    const data = await this.client.request<{ removeAboutPageCanvas: AboutPage }, { id: string }>(
      REMOVE_ABOUT_PAGE_CANVAS_MUTATION,
      { id },
    )
    return data.removeAboutPageCanvas
  }

  async addTextBlock(
    canvasId: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<AboutPage> {
    const data = await this.client.request<
      { addAboutPageTextBlock: AboutPage },
      { canvasId: string; text: string; x: number; y: number; width: number; height: number }
    >(ADD_ABOUT_PAGE_TEXT_BLOCK_MUTATION, { canvasId, text, x, y, width, height })
    return data.addAboutPageTextBlock
  }

  async addPhotoBlock(
    canvasId: string,
    mimeType: string,
    imageBase64: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<AboutPage> {
    const data = await this.client.request<
      { addAboutPagePhotoBlock: AboutPage },
      {
        canvasId: string
        mimeType: string
        imageBase64: string
        x: number
        y: number
        width: number
        height: number
      }
    >(ADD_ABOUT_PAGE_PHOTO_BLOCK_MUTATION, { canvasId, mimeType, imageBase64, x, y, width, height })
    return data.addAboutPagePhotoBlock
  }

  async addButtonBlock(
    canvasId: string,
    text: string,
    linkUrl: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<AboutPage> {
    const data = await this.client.request<
      { addAboutPageButtonBlock: AboutPage },
      {
        canvasId: string
        text: string
        linkUrl: string
        x: number
        y: number
        width: number
        height: number
      }
    >(ADD_ABOUT_PAGE_BUTTON_BLOCK_MUTATION, { canvasId, text, linkUrl, x, y, width, height })
    return data.addAboutPageButtonBlock
  }

  async addGalleryBlock(
    canvasId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    slideIntervalSeconds: number,
  ): Promise<AboutPage> {
    const data = await this.client.request<
      { addAboutPageGalleryBlock: AboutPage },
      { canvasId: string; x: number; y: number; width: number; height: number; slideIntervalSeconds: number }
    >(ADD_ABOUT_PAGE_GALLERY_BLOCK_MUTATION, { canvasId, x, y, width, height, slideIntervalSeconds })
    return data.addAboutPageGalleryBlock
  }

  async addGalleryPhoto(blockId: string, mimeType: string, imageBase64: string): Promise<AboutPage> {
    const data = await this.client.request<
      { addAboutPageGalleryPhoto: AboutPage },
      { blockId: string; mimeType: string; imageBase64: string }
    >(ADD_ABOUT_PAGE_GALLERY_PHOTO_MUTATION, { blockId, mimeType, imageBase64 })
    return data.addAboutPageGalleryPhoto
  }

  async removeGalleryPhoto(blockId: string, imageId: string): Promise<AboutPage> {
    const data = await this.client.request<
      { removeAboutPageGalleryPhoto: AboutPage },
      { blockId: string; imageId: string }
    >(REMOVE_ABOUT_PAGE_GALLERY_PHOTO_MUTATION, { blockId, imageId })
    return data.removeAboutPageGalleryPhoto
  }

  async updateGalleryInterval(id: string, slideIntervalSeconds: number): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageGalleryInterval: AboutPage },
      { id: string; slideIntervalSeconds: number }
    >(UPDATE_ABOUT_PAGE_GALLERY_INTERVAL_MUTATION, { id, slideIntervalSeconds })
    return data.updateAboutPageGalleryInterval
  }

  async copyBlock(blockId: string, canvasId: string): Promise<AboutPage> {
    const data = await this.client.request<
      { copyAboutPageBlock: AboutPage },
      { blockId: string; canvasId: string }
    >(COPY_ABOUT_PAGE_BLOCK_MUTATION, { blockId, canvasId })
    return data.copyAboutPageBlock
  }

  async updateBlockLayout(id: string, x: number, y: number, width: number, height: number): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockLayout: AboutPage },
      { id: string; x: number; y: number; width: number; height: number }
    >(UPDATE_ABOUT_PAGE_BLOCK_LAYOUT_MUTATION, { id, x, y, width, height })
    return data.updateAboutPageBlockLayout
  }

  async updateBlockAlign(id: string, align: AboutPageBlockAlign): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockAlign: AboutPage },
      { id: string; align: AboutPageBlockAlign }
    >(UPDATE_ABOUT_PAGE_BLOCK_ALIGN_MUTATION, { id, align })
    return data.updateAboutPageBlockAlign
  }

  async updateBlockLayer(id: string, layer: number): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockLayer: AboutPage },
      { id: string; layer: number }
    >(UPDATE_ABOUT_PAGE_BLOCK_LAYER_MUTATION, { id, layer })
    return data.updateAboutPageBlockLayer
  }

  async updateBlockText(id: string, text: string, language: AboutPageLanguage): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockText: AboutPage },
      { id: string; text: string; language: AboutPageLanguage }
    >(UPDATE_ABOUT_PAGE_BLOCK_TEXT_MUTATION, { id, text, language })
    return data.updateAboutPageBlockText
  }

  async updateBlockLink(id: string, linkUrl: string): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockLink: AboutPage },
      { id: string; linkUrl: string }
    >(UPDATE_ABOUT_PAGE_BLOCK_LINK_MUTATION, { id, linkUrl })
    return data.updateAboutPageBlockLink
  }

  async removeBlock(id: string): Promise<AboutPage> {
    const data = await this.client.request<{ removeAboutPageBlock: AboutPage }, { id: string }>(
      REMOVE_ABOUT_PAGE_BLOCK_MUTATION,
      { id },
    )
    return data.removeAboutPageBlock
  }
}
