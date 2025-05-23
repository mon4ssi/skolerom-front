import { Locales } from './enums';

const N2350 = 2350;
const N2150 = 2150;
const N1800 = 1800;
const N1600 = 1600;
const N1200 = 1200;
const N1100 = 1100;
const rows = 4;
const rowsresponsive = 6;
const N7 = 7;
const N6 = 6;
const N5 = 5;
const N4 = 4;
const N3 = 3;
const N20 = 20;
const N21 = 21;

export const SAVE_DELAY = 2000;
export const DEBOUNCE_TIME = 500;
export const DEFAULT_AMOUNT_ARTICLES_PER_PAGE = 30;
export const DEFAULT_CUSTOM_IMAGES_PER_PAGE = 8;
export const SHOW_MESSAGE_DELAY = 3500;
export const SCROLL_OFFSET = 6;

export const SLIDER_WIDGET_ZOOM_OUT_ANIMATION_KEY = 'ken_burns';
export const SLIDER_WIDGET_TIME_TIL_NEXT_SLIDE = 7000;

export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH_500 = 500;
export const MAX_DESCRIPTION_LENGTH_MAX = 700;

export const DEFAULT_LOCALE = Locales.NB;

export const TABLET_WIDTH = 1366;
export const GENERAL_MOBILE_WIDTH = 640;
export const MOBILE_WIDTH = 425;

export const deadlineDateFormat = 'DD. MMM. YYYY';

export const firstLevel = 1;
export const secondLevel = 2;
export const thirdLevel = 3;

export const studentLevels = [firstLevel, secondLevel, thirdLevel];

export const CONDITIONALERROR = 100;

export const LOCALES_MAPPING_FOR_BACKEND = {
  [Locales.EN]: 'eng',
  [Locales.NB]: 'nob',
  [Locales.NN]: 'nno',
  [Locales.FN]: 'fin',
  [Locales.KV]: 'kv',
  [Locales.SU]: 'fi',
  [Locales.RU]: 'ru',
  [Locales.UK]: 'uk'
};

export const WPLENGUAGES = [
  {
    id: 'en',
    shortname: 'en',
    name: 'English'
  },
  {
    id: 'nb',
    shortname: 'bm',
    name: 'Bokmål'
  },
  {
    id: 'nn',
    shortname: 'nn',
    name: 'Nynorsk'
  },
  {
    id: 'kv',
    shortname: 'kv',
    name: 'Kvensk'
  },
  {
    id: 'fi',
    shortname: 'fi',
    name: 'Soumi'
  },
  {
    id: 'ru',
    shortname: 'ru',
    name: 'Русский'
  },
  {
    id: 'uk',
    shortname: 'uk',
    name: 'Українська'
  }
];

export const LANGUAGES = [
  {
    description: 'English',
    shortDescription: 'English',
    shortName: Locales.EN,
    langId: 1
  },
  {
    description: 'Norwegian Bokmål',
    shortDescription: 'Bokmål',
    shortName: Locales.NB,
    langId: 3
  },
  {
    description: 'Norwegian Nynorsk',
    shortDescription: 'Nynorsk',
    shortName: Locales.NN,
    langId: 2
  }
];

export const LANGUAGESB = [
  {
    name: 'English',
    code: Locales.EN,
    id: 1
  },
  {
    name: 'Bokmål',
    code: Locales.NB,
    id: 3
  },
  {
    name: 'Nynorsk',
    code: Locales.NN,
    id: 2
  }
];

export const LANGUAGESC = [
  {
    name: 'Bokmål',
    code: Locales.NB,
    id: 3
  },
  {
    name: 'Nynorsk',
    code: Locales.NN,
    id: 2
  }
];

export const LANGUAGESD = [
  {
    name: 'Українська',
    code: Locales.UK,
    id: 7
  },
  {
    name: 'Русский',
    code: Locales.RU,
    id: 6
  },
  {
    name: 'Kvensk',
    code: Locales.KV,
    id: 5
  },
  {
    name: 'Soumi',
    code: Locales.SU,
    id: 4
  },
  {
    name: 'Bokmål',
    code: Locales.NB,
    id: 3
  },
  {
    name: 'Nynorsk',
    code: Locales.NN,
    id: 2
  },
  {
    name: 'English',
    code: Locales.NN,
    id: 1
  }
];
// STATUSES

export const STATUS_CONFLICT = 409;
export const STATUS_NOT_FOUND = 404;
export const STATUS_FORBIDDEN = 403;
export const STATUS_BADREQUEST = 402;
export const STATUS_SERVERBADREQUEST = 422;
export const STATUS_UNAUTHORIZED = 401;
export const STATUS_SERVER_ERROR = 500;
export const STATUS_BACKEND_ERROR = 400;

// constans by responsively
let insidenumber = 1;
const widthWin = window.innerWidth;
switch (true) {
  case (widthWin > N2350):
    insidenumber = rows * N7;
    break;
  case (widthWin < N2350 && widthWin > N2150):
    insidenumber = rows * N7;
    break;
  case (widthWin < N2150 && widthWin > N1800):
    insidenumber = rows * N6;
    break;
  case (widthWin < N1800 && widthWin > N1600):
    insidenumber = rows * N5;
    break;
  case (widthWin < N1600 && widthWin > N1200):
    insidenumber = rowsresponsive * N4;
    break;
  case (widthWin < N1200 && widthWin > N1100):
    insidenumber = rowsresponsive * N3;
    break;
  case (widthWin < N1100):
    insidenumber = rowsresponsive * N4;
    break;
  default:
    insidenumber = N20;
    break;
}
export const postperpage = insidenumber;
