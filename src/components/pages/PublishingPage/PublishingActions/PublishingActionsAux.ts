import { FilterGrep, GoalsData, Grade, GreepSelectValue, GrepFilters, Subject } from 'assignment/Assignment';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';

import checkRoundedIcon from 'assets/images/check-rounded-white-bg.svg';
import checkActiveIcon from 'assets/images/check-active.svg';
import goalsImgIcon from 'assets/images/goals.svg';
import visibilityImgIcon from 'assets/images/visibility.svg';
import publicImgIcon from 'assets/images/teacher-public.svg';
import privateImgIcon from 'assets/images/private.svg';

export const PublishingActionsIcons: IconsList = {
  checkRounded: checkRoundedIcon,
  checkActive: checkActiveIcon,
  goalsImg: goalsImgIcon,
  visibilityImg: visibilityImgIcon,
  publicIconImg: publicImgIcon,
  privateIconImg: privateImgIcon
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
}

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
  valueLocaleId: number | null;
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
    page: MAGICNUMBER1,
    pageCurrent: MAGICNUMBER1,
    loadingGoals: true,
    isOpen: false,
    IsVisibilityButtons: false,
    valueLocaleId: null
  };
  return newState;
};
