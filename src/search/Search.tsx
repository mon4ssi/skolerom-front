import flatMap from 'lodash/flatMap';
import { observable, computed } from 'mobx';

export const SEARCH_REPO = 'SEARCH_REPO';

export interface SearchRepo {
  getDataSearch(filter: Filter): Promise<Array<Search>>;
}

export interface SimpleNumberData {
  id: number;
  name: string;
}

export interface SimpleStringData {
  id: string;
  name: string;
}

export interface SearchArgs {
  type: string;
  id: number;
  grades?: Array<SimpleNumberData>;
  subjects?: Array<SimpleNumberData>;
  coreElements?: Array<SimpleStringData>;
  topics?: Array<SimpleStringData>;
  source?: Array<SimpleNumberData>;
  goals?: Array<SimpleStringData>;
  localeid: string;
  keywords?: Array<string>;
  title: string;
  featuredImg?: string;
  description: string;
  lvlArticles?: Array<number>;
  relatedArticles?: Array<number>;
  relatedTp?: Array<number>;
  relatedAssignment?: Array<number>;
}
export class Search {
  public type: string;
  public id: number;
  public grades: Array<SimpleNumberData>;
  public subjects: Array<SimpleNumberData>;
  public coreElements: Array<SimpleStringData>;
  public topics: Array<SimpleStringData>;
  public source: Array<SimpleNumberData>;
  public goals: Array<SimpleStringData>;
  public localeid: string;
  public keywords: Array<string>;
  public title: string;
  public featuredImg: string;
  public description: string;
  public lvlArticles: Array<number>;
  public relatedArticles: Array<number>;
  public relatedTp: Array<number>;
  public relatedAssignment: Array<number>;
  constructor(args: SearchArgs) {
    this.type = args.type;
    this.id = args.id;
    this.grades = args.grades || [];
    this.subjects = args.subjects || [];
    this.coreElements = args.coreElements || [];
    this.topics = args.topics || [];
    this.source = args.source || [];
    this.goals = args.goals || [];
    this.localeid = args.localeid;
    this.keywords = args.keywords || [];
    this.featuredImg = args.featuredImg || '';
    this. title = args.title;
    this.description = args.description;
    this.lvlArticles = args.lvlArticles || [];
    this.relatedArticles = args.relatedArticles || [];
    this.relatedTp = args.relatedTp || [];
    this.relatedAssignment = args.relatedAssignment || [];
  }
}

export class Filter {
  @observable public page?: number | null;
  // tslint:disable-next-line: variable-name
  @observable public per_page?: number | null;
  @observable public lang?: string | null;
  @observable public type?: number | null;
  @observable public searchQuery?: string | null;
  @observable public grades?: Array<number> | null;
  @observable public subjects?: Array<number> | null;
  @observable public coreElements?: Array<string> | null;
  @observable public topics?: Array<string> | null;
  @observable public source?: Array<number> | null;
  @observable public goals?: Array<string> | null;
}
