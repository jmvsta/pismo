import type { AboutPageLanguage } from '../../services/about/index.ts'

const ABOUT_EDIT_TEXT = {
  editPage: { EN: 'Edit page', RU: 'Редактировать страницу', SRB: 'Uredi stranicu' },
  doneEditing: { EN: 'Done editing', RU: 'Готово', SRB: 'Završi uređivanje' },
  addCanvas: { EN: '+ Add canvas', RU: '+ Добавить холст', SRB: '+ Dodaj platno' },
  addText: { EN: '+ Add text', RU: '+ Добавить текст', SRB: '+ Dodaj tekst' },
  addPhoto: { EN: '+ Add photo', RU: '+ Добавить фото', SRB: '+ Dodaj fotografiju' },
  uploading: { EN: 'Uploading…', RU: 'Загрузка…', SRB: 'Otpremanje…' },
  addButton: { EN: '+ Add button', RU: '+ Добавить кнопку', SRB: '+ Dodaj dugme' },
  changeBackground: { EN: 'Change background', RU: 'Изменить фон', SRB: 'Promeni pozadinu' },
  setBackground: { EN: '+ Set background', RU: '+ Задать фон', SRB: '+ Postavi pozadinu' },
  removeBackground: { EN: 'Remove background', RU: 'Удалить фон', SRB: 'Ukloni pozadinu' },
  removeCanvas: { EN: 'Remove canvas', RU: 'Удалить холст', SRB: 'Ukloni platno' },
  edit: { EN: 'Edit', RU: 'Изменить', SRB: 'Uredi' },
  link: { EN: 'Link', RU: 'Ссылка', SRB: 'Link' },
  delete: { EN: 'Delete', RU: 'Удалить', SRB: 'Obriši' },
  addGallery: { EN: '+ Add gallery', RU: '+ Добавить галерею', SRB: '+ Dodaj galeriju' },
  addPhotos: { EN: '+ Add photos', RU: '+ Добавить фотографии', SRB: '+ Dodaj fotografije' },
  slideInterval: { EN: 'Seconds per photo', RU: 'Секунд на фото', SRB: 'Sekundi po fotografiji' },
  galleryEmpty: {
    EN: 'Empty gallery — add photos below',
    RU: 'Пустая галерея — добавьте фото ниже',
    SRB: 'Prazna galerija — dodaj fotografije ispod',
  },
  removePhoto: { EN: 'Remove photo', RU: 'Удалить фото', SRB: 'Ukloni fotografiju' },
  moveUp: { EN: 'Move up', RU: 'Переместить выше', SRB: 'Pomeri gore' },
  moveDown: { EN: 'Move down', RU: 'Переместить ниже', SRB: 'Pomeri dole' },
  blockCopied: {
    EN: 'Block copied — click the canvas you want and press Ctrl+V',
    RU: 'Блок скопирован — выберите нужный холст и нажмите Ctrl+V',
    SRB: 'Blok je kopiran — izaberi platno i pritisni Ctrl+V',
  },
  fontSize: { EN: 'Size', RU: 'Размер', SRB: 'Veličina' },
  fontSizeHint: {
    EN: 'Font size in px on a wide screen (it shrinks with the canvas on small screens). Empty = default.',
    RU: 'Размер шрифта в px на широком экране (на маленьких экранах уменьшается вместе с холстом). Пусто = по умолчанию.',
    SRB: 'Veličina fonta u px na širokom ekranu (na malim ekranima se smanjuje sa platnom). Prazno = podrazumevano.',
  },
  fontFamily: { EN: 'Font', RU: 'Шрифт', SRB: 'Font' },
  fontDefault: { EN: 'Default', RU: 'Стандартный', SRB: 'Podrazumevani' },
  fontSerif: { EN: 'Serif', RU: 'С засечками', SRB: 'Serif' },
  fontHandwriting: { EN: 'Handwriting', RU: 'Рукописный', SRB: 'Rukopisni' },
  fontMono: { EN: 'Monospace', RU: 'Моноширинный', SRB: 'Monospace' },
  rounded: { EN: 'Rounded', RU: 'Скруглить', SRB: 'Zaobljeno' },
  bordered: { EN: 'Border', RU: 'Рамка', SRB: 'Okvir' },
  highlighted: { EN: 'Highlight', RU: 'Выделить', SRB: 'Istakni' },
  icon: { EN: 'Icon', RU: 'Иконка', SRB: 'Ikona' },
  noIcon: { EN: 'No icon', RU: 'Без иконки', SRB: 'Bez ikone' },
  layer: { EN: 'Layer', RU: 'Слой', SRB: 'Sloj' },
  layerHint: {
    EN: 'Layer: 1 is the backmost',
    RU: 'Слой: 1 — самый дальний',
    SRB: 'Sloj: 1 je najudaljeniji',
  },
} as const

export type AboutEditTextKey = keyof typeof ABOUT_EDIT_TEXT

export function aboutEditText(key: AboutEditTextKey, language: AboutPageLanguage): string {
  return ABOUT_EDIT_TEXT[key][language]
}
