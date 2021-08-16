import { Locales } from './enums';

export const SAVE_DELAY = 2000;
export const DEBOUNCE_TIME = 500;
export const DEFAULT_AMOUNT_ARTICLES_PER_PAGE = 30;
export const SHOW_MESSAGE_DELAY = 3500;
export const SCROLL_OFFSET = 6;

export const SLIDER_WIDGET_ZOOM_OUT_ANIMATION_KEY = 'ken_burns';
export const SLIDER_WIDGET_TIME_TIL_NEXT_SLIDE = 7000;

export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH_500 = 500;

export const DEFAULT_LOCALE = Locales.NB;

export const TABLET_WIDTH = 1366;
export const GENERAL_MOBILE_WIDTH = 640;
export const MOBILE_WIDTH = 425;

export const deadlineDateFormat = 'DD/MM YYYY';

export const firstLevel = 1;
export const secondLevel = 2;
export const thirdLevel = 3;

export const studentLevels = [firstLevel, secondLevel, thirdLevel];

export const LOCALES_MAPPING_FOR_BACKEND = {
  [Locales.EN]: 'eng',
  [Locales.NB]: 'nob',
  [Locales.NN]: 'nno'
};

// STATUSES

export const STATUS_CONFLICT = 409;
export const STATUS_FORBIDDEN = 403;
export const STATUS_NOT_FOUND = 404;
export const STATUS_UNAUTHORIZED = 401;
export const STATUS_SERVER_ERROR = 500;
