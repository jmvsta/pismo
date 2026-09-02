import type { GraphqlClient } from '../graphqlClient.ts'
import type { AboutPage, AboutPageBlockAlign } from './types.ts'
import type { AboutService } from './AboutService.ts'

const ABOUT_PAGE_FIELDS = `
  body
  updatedAt
  blocks {
    id
    type
    text
    imageId
    x
    y
    width
    height
    align
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

const ADD_ABOUT_PAGE_TEXT_BLOCK_MUTATION = `
  mutation AddAboutPageTextBlock($text: String!, $x: Float!, $y: Float!, $width: Float!, $height: Float!) {
    addAboutPageTextBlock(text: $text, x: $x, y: $y, width: $width, height: $height) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const ADD_ABOUT_PAGE_PHOTO_BLOCK_MUTATION = `
  mutation AddAboutPagePhotoBlock(
    $mimeType: String!
    $imageBase64: String!
    $x: Float!
    $y: Float!
    $width: Float!
    $height: Float!
  ) {
    addAboutPagePhotoBlock(mimeType: $mimeType, imageBase64: $imageBase64, x: $x, y: $y, width: $width, height: $height) {
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

  async addTextBlock(text: string, x: number, y: number, width: number, height: number): Promise<AboutPage> {
    const data = await this.client.request<
      { addAboutPageTextBlock: AboutPage },
      { text: string; x: number; y: number; width: number; height: number }
    >(ADD_ABOUT_PAGE_TEXT_BLOCK_MUTATION, { text, x, y, width, height })
    return data.addAboutPageTextBlock
  }

  async addPhotoBlock(
    mimeType: string,
    imageBase64: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<AboutPage> {
    const data = await this.client.request<
      { addAboutPagePhotoBlock: AboutPage },
      { mimeType: string; imageBase64: string; x: number; y: number; width: number; height: number }
    >(ADD_ABOUT_PAGE_PHOTO_BLOCK_MUTATION, { mimeType, imageBase64, x, y, width, height })
    return data.addAboutPagePhotoBlock
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

  async removeBlock(id: string): Promise<AboutPage> {
    const data = await this.client.request<{ removeAboutPageBlock: AboutPage }, { id: string }>(
      REMOVE_ABOUT_PAGE_BLOCK_MUTATION,
      { id },
    )
    return data.removeAboutPageBlock
  }
}
