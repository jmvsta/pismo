import { graphqlClient } from '../graphqlClient.ts'
import { GraphqlAboutService } from './GraphqlAboutService.ts'

export type { AboutService } from './AboutService.ts'
export type { AboutPage, AboutPageBlock, AboutPageBlockType, AboutPageBlockAlign } from './types.ts'

export const aboutService = new GraphqlAboutService(graphqlClient)
