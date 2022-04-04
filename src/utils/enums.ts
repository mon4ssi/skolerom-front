export enum EntityType {
  ASSIGNMENT,
  TEACHING_PATH
}

export enum Locales {
  EN = 'en',
  NB = 'nb',
  NN = 'nn'
}

export enum BooleanFilter {
  TRUE = 'true',
  FALSE = 'false'
}

export enum ActivityFilter {
  INACTIVE,
  ACTIVE,
  ALL
}

export enum SortingFilter {
  ASC = 'asc',
  DESC = 'desc',

  DEADLINE = 'deadline',
  CREATION_DATE = 'creationDate'
}

export enum ArticleLevels {
  FIRST_LEVEL = 'niva-1',
  SECOND_LEVEL = 'niva-2',
  THIRD_LEVEL = 'niva-3'
}

export enum EditEntityLocaleKeys {
  NEW_ASSIGNMENT = 'new assignment',
  EDIT_TEACHING_PATH = 'edit_teaching_path'
}

export enum StoreState {
  PENDING,
  LOADING,
  ERROR,
}

export enum SliderButtonBehavior {
  CURRENT_TAB = 'self_window',
  NEW_TAB = 'new_window',
  POPUP = 'popup_window',
}

export enum QueryStringKeys {
  GRADE = 'grade',
  SUBJECT = 'subject',
  ORDER = 'order',
  ORDER_FIELD = 'orderField',
  SEARCH = 'search',
  PAGE = 'page',
  ACTIVITY = 'activity',
  IS_ANSWERED = 'isAnswered',
  IS_EVALUATED = 'isEvaluated',
  GREPCOREELEMENTSIDS = 'grepCoreElementsIds',
  GREPMAINTOPICSIDS = 'grepMainTopicsIds',
  GREEPGOALSIDS = 'grepGoalsIds',
  GREPREADINGINSUBJECT = 'grepReadingInSubject',
  SOURCE = 'source',
}

export enum ReturnUrl {
  RETURN_URL = 'return_url',
  TIME_EXPIRED = 'return_url_expired'
}
