import type { Language } from '../store/languageStore.ts'

const UI_TEXT = {
  navFeed: { EN: 'Feed', RU: 'Лента', SRB: 'Feed' },
  navAbout: { EN: 'About', RU: 'О нас', SRB: 'O nama' },
  navPenPals: { EN: 'Pen Pals', RU: 'Друзья', SRB: 'Pen pali' },
  navModerate: { EN: 'Moderate', RU: 'Модерация', SRB: 'Moderacija' },
  navLogIn: { EN: 'Log in', RU: 'Войти', SRB: 'Prijava' },
  navRegister: { EN: 'Register', RU: 'Регистрация', SRB: 'Registracija' },
  navLogOut: { EN: 'Log out', RU: 'Выйти', SRB: 'Odjava' },

  matchesTitle: { EN: 'Find a pen pal', RU: 'Найти друга по переписке', SRB: 'Pronađi pen pala' },
  matchesDescription: {
    EN: "Browse profiles matched by shared interests. Reach out to start a letter, or hide a profile you're not interested in — this isn't a dating app, just pen pals.",
    RU: 'Просматривайте анкеты, подобранные по общим интересам. Напишите, чтобы начать переписку, или скройте анкету, если она вам неинтересна — это не приложение знакомств, а просто друзья по переписке.',
    SRB: 'Pregledaj profile uparene po zajedničkim interesovanjima. Javi se da započneš pismo, ili sakrij profil koji te ne zanima — ovo nije aplikacija za upoznavanje, samo pen pali.',
  },
  matchesTabNew: { EN: 'New', RU: 'Новые', SRB: 'Novo' },
  matchesTabPending: { EN: 'Pending', RU: 'В ожидании', SRB: 'Na čekanju' },
  matchesTabHidden: { EN: 'Hidden', RU: 'Скрытые', SRB: 'Skriveno' },
  matchesTabMatched: { EN: 'Matched', RU: 'В переписке', SRB: 'Upareno' },

  profileTabPenPals: { EN: 'Pen pals', RU: 'Друзья', SRB: 'Pen pali' },
  profileTabLetters: { EN: 'Letters', RU: 'Письма', SRB: 'Pisma' },
  profileTabQuestionnaire: { EN: 'Questionnaire', RU: 'Анкета', SRB: 'Upitnik' },
  profileTabAddress: { EN: 'Address', RU: 'Адрес', SRB: 'Adresa' },
  profileStatSent: { EN: 'sent', RU: 'отправлено', SRB: 'poslato' },
  profileStatReceived: { EN: 'received', RU: 'получено', SRB: 'primljeno' },
  profileStatPenPals: { EN: 'pen pals', RU: 'друзей', SRB: 'pen pala' },

  forumNewPost: { EN: '+ New post', RU: '+ Новый пост', SRB: '+ Nova objava' },
  forumNewTopic: { EN: '+ New topic', RU: '+ Новая тема', SRB: '+ Nova tema' },
  forumTopics: { EN: 'Topics', RU: 'Темы', SRB: 'Teme' },
  forumAllPosts: { EN: 'All posts', RU: 'Все посты', SRB: 'Sve objave' },
  forumFrozen: { EN: 'Frozen', RU: 'Заморожено', SRB: 'Zamrznuto' },
  forumLoadMore: { EN: 'Load more posts ↓', RU: 'Загрузить ещё ↓', SRB: 'Učitaj još ↓' },
  forumLoading: { EN: 'Loading…', RU: 'Загрузка…', SRB: 'Učitavanje…' },
  forumNothingHere: { EN: 'Nothing here yet — check back later.', RU: 'Здесь пока пусто — загляните позже.', SRB: 'Ovde još ništa nema — svrati kasnije.' },
  forumSuggestedPenPals: { EN: 'Suggested pen pals', RU: 'Рекомендуемые друзья', SRB: 'Predloženi pen pali' },
  forumSeeAllRecommended: { EN: 'See all recommended →', RU: 'Смотреть все рекомендации →', SRB: 'Pogledaj sve preporuke →' },
  forumMailboxTitle: { EN: 'Send me a letter', RU: 'Отправьте мне письмо', SRB: 'Pošalji mi pismo' },
  forumMailboxSent: {
    EN: 'Sent! A moderator will pick this up and write to you soon.',
    RU: 'Отправлено! Модератор скоро возьмётся за это и напишет вам.',
    SRB: 'Poslato! Moderator će uskoro preuzeti ovo i pisati vam.',
  },
  forumMailboxError: { EN: 'Something went wrong — try again.', RU: 'Что-то пошло не так — попробуйте снова.', SRB: 'Nešto je pošlo po zlu — pokušaj ponovo.' },
  forumMailboxCopy: {
    EN: 'I wish to share with you a letter. Handwritten, with a carefully chosen paper and a stamp, taken to the post office, mailed the old style. Dozen mailed already, plenty received in return. If this idea makes You smile, come and share with us! May I send you a letter?',
    RU: 'Хочу поделиться с вами письмом. Написанным от руки, на тщательно выбранной бумаге, с маркой, отнесённым на почту — по старинке. Уже отправлено немало, и немало получено в ответ. Если эта идея вызывает у вас улыбку, присоединяйтесь к нам! Можно отправить вам письмо?',
    SRB: 'Želim da podelim sa tobom pismo. Rukom pisano, na pažljivo odabranom papiru, sa markicom, odneto na poštu, poslato na stari način. Već je poslato mnogo, i mnogo je primljeno zauzvrat. Ako te ova ideja nasmeje, pridruži nam se! Mogu li da ti pošaljem pismo?',
  },

  adminEyebrow: { EN: 'Admin', RU: 'Админ', SRB: 'Admin' },
  adminModeration: { EN: 'Moderation', RU: 'Модерация', SRB: 'Moderacija' },
  adminTabUsers: { EN: 'Users', RU: 'Пользователи', SRB: 'Korisnici' },
  adminTabQuestionnaire: { EN: 'Questionnaire', RU: 'Анкета', SRB: 'Upitnik' },
  adminTabTopics: { EN: 'Topics', RU: 'Темы', SRB: 'Teme' },

  notifBell: { EN: 'Notifications', RU: 'Уведомления', SRB: 'Obaveštenja' },
  notifEmpty: { EN: 'No notifications yet.', RU: 'Пока нет уведомлений.', SRB: 'Još nema obaveštenja.' },

  letterSendNew: { EN: 'Send new letter', RU: 'Отправить новое письмо', SRB: 'Pošalji novo pismo' },
  letterAddAddress: { EN: 'Add your address', RU: 'Добавьте свой адрес', SRB: 'Dodaj svoju adresu' },
  letterAddAddressSuffix: { EN: 'first.', RU: 'сначала.', SRB: 'prvo.' },
  letterAddressLabel: { EN: "'s address:", RU: ': адрес:', SRB: '-ova adresa:' },
  letterWaitingForAddress: {
    EN: "{name} hasn't added an address yet.",
    RU: '{name} ещё не добавил(а) адрес.',
    SRB: '{name} još nije dodao/la adresu.',
  },
  letterCancel: { EN: 'Cancel this letter', RU: 'Отменить это письмо', SRB: 'Otkaži ovo pismo' },
  letterMarkReceived: { EN: 'Mark as received', RU: 'Отметить как полученное', SRB: 'Označi kao primljeno' },

  sendLetterTitle: { EN: 'Send a letter to', RU: 'Отправить письмо', SRB: 'Pošalji pismo' },
  sendLetterSendTo: { EN: 'Send to:', RU: 'Отправить на:', SRB: 'Pošalji na:' },
  cancel: { EN: 'Cancel', RU: 'Отмена', SRB: 'Otkaži' },
  saving: { EN: 'Saving…', RU: 'Сохранение…', SRB: 'Čuvanje…' },
  sendLetterConfirmSent: { EN: "I've written and sent it →", RU: 'Я написал(а) и отправил(а) →', SRB: 'Napisao/la sam i poslao/la →' },

  authPitch: {
    EN: 'Handwritten letters, sent by real post, between people matched by what they actually care about. A deliberate anti-social-network.',
    RU: 'Письма от руки, отправленные настоящей почтой, между людьми, подобранными по тому, что их действительно интересует. Осознанная анти-социальная сеть.',
    SRB: 'Rukom pisana pisma, poslata pravom poštom, između ljudi uparenih po tome šta ih zaista interesuje. Namerna anti-društvena mreža.',
  },
  authOr: { EN: 'or', RU: 'или', SRB: 'ili' },
  authContinueWithGoogle: { EN: 'Continue with Google', RU: 'Продолжить с Google', SRB: 'Nastavi sa Google' },

  loginWelcomeBack: { EN: 'Welcome back', RU: 'С возвращением', SRB: 'Dobrodošao/la nazad' },
  loginSignIn: { EN: 'Sign in', RU: 'Войти', SRB: 'Prijava' },
  loginEmailOrUsername: { EN: 'Email or username', RU: 'Email или имя пользователя', SRB: 'Email ili korisničko ime' },
  loginPassword: { EN: 'Password', RU: 'Пароль', SRB: 'Lozinka' },
  loginSigningIn: { EN: 'Signing in…', RU: 'Выполняется вход…', SRB: 'Prijavljivanje…' },
  loginSignInSubmit: { EN: 'Sign in →', RU: 'Войти →', SRB: 'Prijavi se →' },
  loginNewHere: { EN: 'New here?', RU: 'Впервые здесь?', SRB: 'Novi/a si ovde?' },
  loginCreateAccount: { EN: 'Create an account', RU: 'Создать аккаунт', SRB: 'Napravi nalog' },
  loginFailed: { EN: 'Login failed.', RU: 'Не удалось войти.', SRB: 'Prijava nije uspela.' },

  registerStep01: { EN: '01 — Register', RU: '01 — Регистрация', SRB: '01 — Registracija' },
  registerStep02: { EN: '02 — Verify email', RU: '02 — Подтвердить email', SRB: '02 — Potvrdi email' },
  registerStep03: { EN: '03 — Bio', RU: '03 — О себе', SRB: '03 — Biografija' },
  registerStep04: { EN: '04 — Address', RU: '04 — Адрес', SRB: '04 — Adresa' },
  registerStep05: { EN: '05 — Fill the questionnaire', RU: '05 — Заполнить анкету', SRB: '05 — Popuni upitnik' },
  registerStep06: { EN: '06 — Get matched. Write.', RU: '06 — Найти пару. Писать.', SRB: '06 — Upari se. Piši.' },

  registerStepLabel: { EN: 'Step 01', RU: 'Шаг 01', SRB: 'Korak 01' },
  registerCreateAccount: { EN: 'Create account', RU: 'Создать аккаунт', SRB: 'Napravi nalog' },
  registerUploadAvatar: { EN: 'Upload avatar', RU: 'Загрузить аватар', SRB: 'Dodaj avatar' },
  registerAvatarUpload: { EN: 'avatar upload', RU: 'загрузить аватар', SRB: 'dodaj avatar' },
  registerNickname: { EN: 'Nickname', RU: 'Никнейм', SRB: 'Nadimak' },
  registerDateOfBirth: { EN: 'Date of birth', RU: 'Дата рождения', SRB: 'Datum rođenja' },
  registerEmail: { EN: 'Email', RU: 'Email', SRB: 'Email' },
  registerPassword: { EN: 'Password', RU: 'Пароль', SRB: 'Lozinka' },
  registerPasswordHint: {
    EN: 'Min. 8 characters, at least one number',
    RU: 'Минимум 8 символов, хотя бы одна цифра',
    SRB: 'Min. 8 karaktera, bar jedan broj',
  },
  registerAcceptRules: {
    EN: 'I accept the community rules and privacy policy',
    RU: 'Я принимаю правила сообщества и политику конфиденциальности',
    SRB: 'Prihvatam pravila zajednice i politiku privatnosti',
  },
  registerCreatingAccount: { EN: 'Creating account…', RU: 'Создание аккаунта…', SRB: 'Pravljenje naloga…' },
  registerCreateAccountSubmit: { EN: 'Create account →', RU: 'Создать аккаунт →', SRB: 'Napravi nalog →' },
  registerAlreadyMember: { EN: 'Already a member?', RU: 'Уже есть аккаунт?', SRB: 'Već imaš nalog?' },
  registerSignIn: { EN: 'Sign in', RU: 'Войти', SRB: 'Prijavi se' },
  registerFailed: { EN: 'Registration failed.', RU: 'Не удалось зарегистрироваться.', SRB: 'Registracija nije uspela.' },
} as const

export type UiTextKey = keyof typeof UI_TEXT

export function uiText(key: UiTextKey, language: Language): string {
  return UI_TEXT[key][language]
}

export function uiTextWithName(key: UiTextKey, language: Language, name: string): string {
  return uiText(key, language).replace('{name}', name)
}
