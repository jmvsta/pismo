import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlAboutService } from './GraphqlAboutService.ts'

export type { AboutService } from './AboutService.ts'
export type {
  AboutPage,
  AboutPageCanvas,
  AboutPageBlock,
  AboutPageBlockType,
  AboutPageBlockAlign,
  AboutPageLanguage,
} from './types.ts'
export { pickTranslation } from './types.ts'

export const aboutService = new GraphqlAboutService(graphqlClient)
