import type { AboutPageLanguage } from '../../services/about/index.ts'

const ABOUT_EDIT_TEXT = {
  editPage: { EN: 'Edit page', RU: 'Редактировать страницу', SRB: 'Uredi stranicu' },
  doneEditing: { EN: 'Done editing', RU: 'Готово', SRB: 'Završi uređivanje' },
  saveText: { EN: 'Save text', RU: 'Сохранить текст', SRB: 'Sačuvaj tekst' },
  savingText: { EN: 'Saving…', RU: 'Сохранение…', SRB: 'Čuvanje…' },
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
} as const

export type AboutEditTextKey = keyof typeof ABOUT_EDIT_TEXT

export function aboutEditText(key: AboutEditTextKey, language: AboutPageLanguage): string {
  return ABOUT_EDIT_TEXT[key][language]
}
