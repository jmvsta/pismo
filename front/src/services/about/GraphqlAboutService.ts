import type { GraphqlClient } from '../graphqlClient.ts'
import type { AboutPage, AboutPageBlockAlign } from './types.ts'
import type { AboutService } from './AboutService.ts'

const ABOUT_PAGE_FIELDS = `
  body
  updatedAt
  canvases {
    id
    height
    backgroundImageId
    blocks {
      id
      type
      text
      imageId
      linkUrl
      x
      y
      width
      height
      align
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

const UPDATE_ABOUT_PAGE_BODY_MUTATION = `
  mutation UpdateAboutPageBody($body: String!) {
    updateAboutPageBody(body: $body) {
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

const UPDATE_ABOUT_PAGE_CANVAS_HEIGHT_MUTATION = `
  mutation UpdateAboutPageCanvasHeight($id: ID!, $height: Float!) {
    updateAboutPageCanvasHeight(id: $id, height: $height) {
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

const UPDATE_ABOUT_PAGE_BLOCK_TEXT_MUTATION = `
  mutation UpdateAboutPageBlockText($id: ID!, $text: String!) {
    updateAboutPageBlockText(id: $id, text: $text) {
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

  async updateBody(body: string): Promise<AboutPage> {
    const data = await this.client.request<{ updateAboutPageBody: AboutPage }, { body: string }>(
      UPDATE_ABOUT_PAGE_BODY_MUTATION,
      { body },
    )
    return data.updateAboutPageBody
  }

  async addCanvas(): Promise<AboutPage> {
    const data = await this.client.request<{ addAboutPageCanvas: AboutPage }>(ADD_ABOUT_PAGE_CANVAS_MUTATION)
    return data.addAboutPageCanvas
  }

  async updateCanvasHeight(id: string, height: number): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageCanvasHeight: AboutPage },
      { id: string; height: number }
    >(UPDATE_ABOUT_PAGE_CANVAS_HEIGHT_MUTATION, { id, height })
    return data.updateAboutPageCanvasHeight
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

  async updateBlockText(id: string, text: string): Promise<AboutPage> {
    const data = await this.client.request<
      { updateAboutPageBlockText: AboutPage },
      { id: string; text: string }
    >(UPDATE_ABOUT_PAGE_BLOCK_TEXT_MUTATION, { id, text })
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
