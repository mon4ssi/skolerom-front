import flatMap from 'lodash/flatMap';
import { observable, computed } from 'mobx';

export const SEARCH_REPO = 'SEARCH_REPO';

export interface SearchRepo {
  getDataSearch(filter: Filter): Promise<{items: Array<Search>, filters: FilterMeta, totalpage: number}>;
}

export interface SimpleNumberData {
  id: number;
  name: string;
}

export interface SimpleNumberDataTitle {
  id: number;
  name: string;
}

export interface SimpleStringData {
  id: string;
  name: string;
}

export interface SimpleStringShortData {
  id: string;
  name: string;
  shortname: string;
}

export interface SimpleGoalData {
  id: string;
  name: string;
  // tslint:disable-next-line: variable-name
  grade_id: string;
  // tslint:disable-next-line: variable-name
  grade_name: string;
  // tslint:disable-next-line: variable-name
  subject_id: string;
  // tslint:disable-next-line: variable-name
  subject_name: string;
}

export interface LvlData {
  level: number;
  id: number;
  url: string;
}

export interface SearchArgs {
  type: string;
  id: number;
  grades?: Array<SimpleNumberData>;
  subjects?: Array<SimpleNumberData>;
  coreElements?: Array<SimpleStringData>;
  topics?: Array<SimpleStringData>;
  reading?: Array<SimpleStringData>;
  sources?: Array<SimpleNumberDataTitle>;
  goals?: Array<SimpleGoalData>;
  localeid: string;
  localeId: string;
  keywords?: Array<string>;
  title: string;
  featuredImg?: string;
  description: string;
  lvlArticles?: Array<LvlData>;
  relatedArticles?: Array<number>;
  relatedTp?: Array<number>;
  relatedAssignment?: Array<number>;
  url?: string;
}

export class Search {
  public type: string;
  public id: number;
  public grades: Array<SimpleNumberData>;
  public subjects: Array<SimpleNumberData>;
  public coreElements: Array<SimpleStringData>;
  public topics: Array<SimpleStringData>;
  public sources: Array<SimpleNumberDataTitle>;
  public goals: Array<SimpleGoalData>;
  public reading: Array<SimpleStringData>;
  public localeid: string;
  public localeId: string;
  public keywords: Array<string>;
  public title: string;
  public featuredImg: string;
  public description: string;
  public lvlArticles: Array<LvlData>;
  public relatedArticles: Array<number>;
  public relatedTp: Array<number>;
  public relatedAssignment: Array<number>;
  public url: string | null | undefined;
  constructor(args: SearchArgs) {
    this.type = args.type;
    this.id = args.id;
    this.grades = args.grades || [];
    this.subjects = args.subjects || [];
    this.coreElements = args.coreElements || [];
    this.topics = args.topics || [];
    this.sources = args.sources || [];
    this.goals = args.goals || [];
    this.reading = args.reading || [];
    this.localeid = args.localeid;
    this.localeId = args.localeId || '';
    this.keywords = args.keywords || [];
    this.featuredImg = args.featuredImg || '';
    this.title = args.title;
    this.description = args.description;
    this.lvlArticles = args.lvlArticles || [];
    this.relatedArticles = args.relatedArticles || [];
    this.relatedTp = args.relatedTp || [];
    this.relatedAssignment = args.relatedAssignment || [];
    this.url = args.url;
  }
}

export class Filter {
  @observable public page?: number | null;
  // tslint:disable-next-line: variable-name
  @observable public per_page?: number | null;
  @observable public localeId?: string | null;
  @observable public type?: number | null;
  @observable public searchQuery?: string | null;
  @observable public grades?: Array<number> | null;
  @observable public subjects?: Array<number> | null;
  @observable public coreElements?: Array<string> | null;
  @observable public topics?: Array<string> | null;
  @observable public sources?: Array<number> | null;
  @observable public goals?: Array<string> | null;
  @observable public readingInSubjects?: Array<number> | null;
}

export class FilterMeta {
  @observable public locales?: Array<string> | null;
  @observable public grades?: Array<SimpleNumberData> | null;
  @observable public subjects?: Array<SimpleNumberData> | null;
  @observable public coreElements?: Array<SimpleStringData> | null;
  @observable public topics?: Array<SimpleStringData> | null;
  @observable public sources?: Array<SimpleNumberDataTitle> | null;
  @observable public goals?: Array<SimpleStringData> | null;
  @observable public readingInSubjects?: Array<SimpleNumberDataTitle> | null;
}
