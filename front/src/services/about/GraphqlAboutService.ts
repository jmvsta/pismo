import type { GraphqlClient } from '../graphqlClient.ts'
import type { AboutPage } from './types.ts'
import type { AboutService } from './AboutService.ts'

const ABOUT_PAGE_FIELDS = `
  body
  updatedAt
  photos {
    id
    imageId
    caption
    position
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

const ADD_ABOUT_PAGE_PHOTO_MUTATION = `
  mutation AddAboutPagePhoto($mimeType: String!, $imageBase64: String!, $caption: String) {
    addAboutPagePhoto(mimeType: $mimeType, imageBase64: $imageBase64, caption: $caption) {
      ${ABOUT_PAGE_FIELDS}
    }
  }
`

const REMOVE_ABOUT_PAGE_PHOTO_MUTATION = `
  mutation RemoveAboutPagePhoto($id: ID!) {
    removeAboutPagePhoto(id: $id) {
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

  async addPhoto(mimeType: string, imageBase64: string, caption?: string): Promise<AboutPage> {
    const data = await this.client.request<
      { addAboutPagePhoto: AboutPage },
      { mimeType: string; imageBase64: string; caption?: string }
    >(ADD_ABOUT_PAGE_PHOTO_MUTATION, { mimeType, imageBase64, caption })
    return data.addAboutPagePhoto
  }

  async removePhoto(id: string): Promise<AboutPage> {
    const data = await this.client.request<{ removeAboutPagePhoto: AboutPage }, { id: string }>(
      REMOVE_ABOUT_PAGE_PHOTO_MUTATION,
      { id },
    )
    return data.removeAboutPagePhoto
  }
}
