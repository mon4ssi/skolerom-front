import { FilterGrep, GoalsData, Grade, GreepSelectValue, GrepFilters, Subject, LenguajesB } from 'assignment/Assignment';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';

import checkRoundedIcon from 'assets/images/check-rounded-white-bg.svg';
import checkActiveIcon from 'assets/images/check-active.svg';
import goalsImgIcon from 'assets/images/goals.svg';
import visibilityImgIcon from 'assets/images/visibility.svg';
import publicImgIcon from 'assets/images/teacher-public.svg';
import privateImgIcon from 'assets/images/private.svg';
import viewIcon from 'assets/images/view_icon.svg';
import intl from 'react-intl-universal';

export const PublishingActionsIcons: IconsList = {
  checkRounded: checkRoundedIcon,
  checkActive: checkActiveIcon,
  goalsImg: goalsImgIcon,
  visibilityImg: visibilityImgIcon,
  publicIconImg: publicImgIcon,
  privateIconImg: privateImgIcon,
  viewIconImg: viewIcon
};

export const MAGICNUMBER1 = 1;
export const MAGICNUMBER100 = 100;
export const SETTIMEOUT = 1000;

export interface IconsList {
  checkRounded: string;
  checkActive: string;
  goalsImg: string;
  visibilityImg: string;
  publicIconImg: string;
  privateIconImg: string;
  viewIconImg: string;
}

export interface LabelsList {
  copyWordInTitleNotAllowed: string;
  labelSource: string;
  isOpenTeachingPath: string;
  isOpenAssignment: string;
  labelTitleIsOpen: string;
  labelTitleIsLenguajeTeacher: string;
  placeholderKeywords: string;
  placeholderLanguages: string;
  placeholderSubjects: string;
  placeholderGrades: string;
  textVisibilityForImage: string;
  labelVisibility: string;
  textvisibilityDescription: string;
  labelMySchoolButton: string;
  labelPublicButton: string;
  labelPrivateButton: string;
  placeholderCoreElements: string;
  placeholderMultiDisciplinarySubjects: string;
  placeholderReadingInSubject: string;
  goalsTableHeaderGrade: string;
  goalsTableHeaderSubject: string;
  goalsTableHeaderCoreElements: string;
  goalsTableHeaderGoalInfo: string;
  labelGrades: string;
  labelGoals: string;
  notDdataGoals: string;
  dontEmpty: string;
  selectedMySchools: string;
  titleForPrivateSelected: string;
  titleVariantPrivateNotSelected: string;
  descriptionForPrivateSelected: string;
  descriptionForPublicSelectedTeachingPath: string;
  descriptionForPublicSelectedAssignment: string;
  labelIsReview: string;
}

export const initializeAllLabelsForUI = () => {
  const labelsArray: LabelsList = {
    copyWordInTitleNotAllowed: `${intl.get('new assignment.copy_title_not_allow')}`,
    labelSource: intl.get('publishing_page.source'),
    isOpenTeachingPath: intl.get('publishing_page.source_is_open'),
    isOpenAssignment: intl.get('publishing_page.source_is_open_assig'),
    labelTitleIsOpen: intl.get('publishing_page.source_is_open_title'),
    labelTitleIsLenguajeTeacher: intl.get('publishing_page.lenguaje_isteacher_title'),
    placeholderKeywords: intl.get('publishing_page.keywords'),
    placeholderLanguages: intl.get('publishing_page.languages'),
    placeholderSubjects: intl.get('publishing_page.subject'),
    placeholderGrades: intl.get('publishing_page.grade'),
    textVisibilityForImage: intl.get('generals.visibility'),
    labelVisibility: intl.get('publishing_page.visibility'),
    textvisibilityDescription: intl.get('publishing_page.visibility_description'),
    labelMySchoolButton: intl.get('teaching_path_tabs.My school'),
    labelPublicButton: intl.get('publishing_page.public'),
    labelPrivateButton: intl.get('publishing_page.private'),
    placeholderCoreElements: intl.get('assignments search.Choose Core'),
    placeholderMultiDisciplinarySubjects: intl.get('assignments search.Choose Multi'),
    placeholderReadingInSubject: intl.get('assignments search.Choose reading'),
    goalsTableHeaderGrade: intl.get('new assignment.Grade'),
    goalsTableHeaderSubject: intl.get('new assignment.Subjects'),
    goalsTableHeaderCoreElements: intl.get('new assignment.greep.core'),
    goalsTableHeaderGoalInfo: intl.get('new assignment.greep.goals'),
    labelGrades: intl.get('new assignment.grade'),
    labelGoals: intl.get('new assignment.greep.goals'),
    notDdataGoals: intl.get('edit_teaching_path.header.notdata_goals'),
    dontEmpty: intl.get('publishing_page.dont_empty'),
    selectedMySchools: intl.get('publishing_page.selected_myschools'),
    titleForPrivateSelected: intl.get('publishing_page.grep.title_private'),
    titleVariantPrivateNotSelected: intl.get('publishing_page.grep.title'),
    descriptionForPrivateSelected: intl.get('publishing_page.grep.description_privado'),
    descriptionForPublicSelectedTeachingPath: intl.get('publishing_page.grep.description'),
    descriptionForPublicSelectedAssignment: intl.get('publishing_page.grep.descrption_assignment'),
    labelIsReview: intl.get('teaching_path_tabs.In review')
  };
  return labelsArray;
};

export interface PublishingActionsProps {
  store?: NewAssignmentStore | EditTeachingPathStore;
  from?: string;
}

export interface PublishingActionsState {
  grepFiltersData: FilterGrep;
  optionsCore: Array<GreepSelectValue>;
  optionsMulti: Array<GreepSelectValue>;
  optionsReading: Array<GreepSelectValue>;
  optionsSubjects: Array<GrepFilters>;
  optionsGrades: Array<GrepFilters>;
  valueCoreOptions: Array<number>;
  valueMultiOptions: Array<number>;
  valueSourceOptions: Array<number>;
  valueKeywordsOptions: Array<string>;
  valuereadingOptions: Array<number>;
  valueGradesOptions: Array<number>;
  valueSubjectsOptions: Array<number>;
  optionsGoals: Array<GoalsData>;
  optionsMyGrades: Array<Grade>;
  optionsMySubjects: Array<Subject>;
  optionsMySchool: Array<number>;
  valueStringGoalsOptions: Array<string>;
  valueGoalsOptions: Array<number>;
  editValueCoreOptions: Array<number> | undefined;
  editvalueMultiOptions: Array<number> | undefined;
  editvaluereadingOptions: Array<number> | undefined;
  editvalueGoalsOptions: Array<number> | undefined;
  page: number;
  pageCurrent: number;
  isValid: boolean;
  isValidPrivate: boolean;
  isMyStateSchool: boolean;
  loadingGoals: boolean;
  isOpen: boolean | undefined;
  IsVisibilityButtons: boolean;
  isReview: boolean;
  valueLocaleId: number | null;
  locales: Array<LenguajesB>;
}

export interface TagPropSource {
  id: number;
  title: string;
  default: boolean;
}

export interface TagPropKeyword {
  id: number;
  title: string;
  default: boolean;
}

export const initializePublishingActionsState = () => {
  const newState: PublishingActionsState = {
    grepFiltersData: {},
    optionsCore: [],
    optionsMulti: [],
    optionsReading: [],
    optionsSubjects: [],
    optionsGrades: [],
    valueCoreOptions: [],
    valueMultiOptions: [],
    valueSourceOptions: [],
    valueKeywordsOptions: [],
    valuereadingOptions: [],
    valueGradesOptions: [],
    valueSubjectsOptions: [],
    optionsGoals: [],
    optionsMyGrades: [],
    optionsMySubjects: [],
    valueStringGoalsOptions: [],
    valueGoalsOptions: [],
    editValueCoreOptions: [],
    editvalueMultiOptions: [],
    editvaluereadingOptions: [],
    editvalueGoalsOptions: [],
    optionsMySchool: [],
    isValid: false,
    isValidPrivate: true,
    isMyStateSchool: false,
    isReview: false,
    page: MAGICNUMBER1,
    pageCurrent: MAGICNUMBER1,
    loadingGoals: true,
    isOpen: false,
    IsVisibilityButtons: false,
    valueLocaleId: null,
    locales: []
  };
  return newState;
};
