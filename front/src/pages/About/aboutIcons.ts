import {
  IconBook,
  IconBook2,
  IconBrush,
  IconBulb,
  IconCalendar,
  IconCamera,
  IconCoffee,
  IconFeather,
  IconFlower,
  IconGift,
  IconHeart,
  IconHeartHandshake,
  IconHome,
  IconLink,
  IconMailbox,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconMusic,
  IconNotebook,
  IconPalette,
  IconPaw,
  IconPencil,
  IconPhoto,
  IconPlane,
  IconSend,
  IconStar,
  IconSun,
  IconToolsKitchen2,
  IconUsers,
  IconWriting,
} from '@tabler/icons-react'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import type { Icon, IconProps } from '@tabler/icons-react'

// The names stored on a BUTTON block are the Tabler icon names, so the stored value matches
// the icon's name in Tabler's own catalogue.
const ABOUT_ICONS = new Map<string, Icon>([
  ['pencil', IconPencil],
  ['book', IconBook],
  ['camera', IconCamera],
  ['tools-kitchen-2', IconToolsKitchen2],
  ['palette', IconPalette],
  ['book-2', IconBook2],
  ['writing', IconWriting],
  ['notebook', IconNotebook],
  ['feather', IconFeather],
  ['brush', IconBrush],
  ['photo', IconPhoto],
  ['music', IconMusic],
  ['mail', IconMail],
  ['mailbox', IconMailbox],
  ['send', IconSend],
  ['message-circle', IconMessageCircle],
  ['heart', IconHeart],
  ['heart-handshake', IconHeartHandshake],
  ['users', IconUsers],
  ['star', IconStar],
  ['flower', IconFlower],
  ['coffee', IconCoffee],
  ['gift', IconGift],
  ['sun', IconSun],
  ['paw', IconPaw],
  ['bulb', IconBulb],
  ['plane', IconPlane],
  ['map-pin', IconMapPin],
  ['calendar', IconCalendar],
  ['home', IconHome],
  ['link', IconLink],
])

export const ABOUT_ICON_NAMES = [...ABOUT_ICONS.keys()]

/** Renders the named icon, or nothing when the name is empty or isn't one we know. */
export function renderAboutIcon(name: string | null, props: IconProps): ReactNode {
  const icon = name ? ABOUT_ICONS.get(name) : undefined
  return icon ? createElement(icon, props) : null
}
