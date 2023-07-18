import React, { Component, SyntheticEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import { SearchStore } from '../SearchStore';
import { Search } from '../Search';
import { SearchItemComponent } from '../searchItem/searchItem';
import { DEBOUNCE_TIME } from 'utils/constants';
import { injector } from 'Injector';
import { lettersNoEn } from 'utils/lettersNoEn';
import { SortingFilter, StoreState, QueryStringKeys, QueryStringKeysSearch } from 'utils/enums';
import { StorageInteractor, STORAGE_INTERACTOR_KEY } from 'utils/storageInteractor';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import './searchListComponent.scss';

const number2 = 2;
const number3 = 3;

interface SearchProps {
  type : string;
  isFilter: boolean;
  items: Array<Search>;
  searchStore?: SearchStore;
  handerScroll?(): void;
}

interface SearchState {
  searchItems: Array<Search>;
  type: string;
}
@inject('searchStore')
@observer
class SearchMyList extends Component<SearchProps & RouteComponentProps, SearchState> {
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  public state = {
    searchItems: [],
    type: ''
  };
  public getDataSearchComponents = () => {
    const { myfilter } = this.props.searchStore!;
    switch (this.props.type) {
      case 'ARTICLE':
        myfilter.type = 1;
        break;
      case 'TEACHING-PATH':
        myfilter.type = number2;
        break;
      case 'ASSIGNMENT':
        myfilter.type = number3;
        break;
      default:
        myfilter.type = 1;
        break;
    }
    const mygrades : Array<number> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GRADE)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GRADE)!.split(',').forEach((e) => {
        mygrades.push(Number(e));
      });
    }
    const mysubjects : Array<number> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SUBJECT)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SUBJECT)!.split(',').forEach((e) => {
        mysubjects.push(Number(e));
      });
    }
    const mycoreelements : Array<string> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREPCOREELEMENTSIDS)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREPCOREELEMENTSIDS)!.split(',').forEach((e) => {
        mycoreelements.push(e);
      });
    }
    const mytopics : Array<string> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREPMAINTOPICSIDS)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREPMAINTOPICSIDS)!.split(',').forEach((e) => {
        mytopics.push(e);
      });
    }
    const mygoalss : Array<string> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREEPGOALSIDS)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREEPGOALSIDS)!.split(',').forEach((e) => {
        mygoalss.push(e);
      });
    }
    const mysources : Array<number> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SOURCE)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SOURCE)!.split(',').forEach((e) => {
        mysources.push(Number(e));
      });
    }
    myfilter.page = QueryStringHelper.getNumber(this.props.history, QueryStringKeysSearch.PAGE, 1);
    myfilter.localeId = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.LANG);
    myfilter.grades = mygrades;
    myfilter.subjects = mysubjects;
    myfilter.coreElements = mycoreelements;
    myfilter.topics = mytopics;
    myfilter.goals = mygoalss;
    myfilter.sources = mysources;
    myfilter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
  }
  public renderSwitchContentList() {
    const { searchItems } = this.state;
    switch (this.props.type) {
      case 'ARTICLE':
        return searchItems.map(this.renderContentListArticle);
        break;
      case 'TEACHING-PATH':
        return searchItems.map(this.renderContentListTP);
        break;
      case 'ASSIGNMENT':
        return searchItems.map(this.renderContentListAssignment);
        break;
      default:
        return searchItems.map(this.renderContentListArticle);
        break;
    }
  }
  public renderEmpty() {
    const { searchItems } = this.state;
    return (
      <div className="emptyTeachingPaths">{intl.get('edit_teaching_path.No results found')}</div>
    );
  }
  public renderContentListArticle(item : Search) {
    return (
      <div key={item.id} className="Inside">
        <SearchItemComponent item={item} type="ARTICLE" />
      </div>
    );
  }
  public renderContentListAssignment(item : Search) {
    return (
      <div key={item.id} className="Inside Inside--horizontal">
        <SearchItemComponent item={item} type="ASSIGNMENT" />
      </div>
    );
  }
  public renderContentListTP(item : Search) {
    return (
      <div key={item.id} className="Inside Inside--horizontal">
        <SearchItemComponent item={item} type="TEACHING-PATH" />
      </div>
    );
  }
  public async forceUpdate() {
    const dataSearch = await this.props.searchStore!.dataitems;
    this.setState({
      searchItems : dataSearch.items
    });
  }
  public async componentDidMount() {
    // this.getDataSearchComponents();
    /*const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;*/
    this.setState({
      type: this.props.type,
      searchItems : this.props.items
    });
    if (document.getElementById('searchListInfo')) {
      document.getElementById('searchListInfo')!.addEventListener('scroll', this.handerScroll);
    }
  }

  public myFilters = () => {
    // typs logic
    switch (this.props.type) {
      case 'ARTICLE':
        this.props.searchStore!.myfilter.type = 1;
        break;
      case 'TEACHING-PATH':
        this.props.searchStore!.myfilter.type = number2;
        break;
      case 'ASSIGNMENT':
        this.props.searchStore!.myfilter.type = number3;
        break;
      default:
        this.props.searchStore!.myfilter.type = 1;
        break;
    }
    // grades logic
    const mygrades : Array<number> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GRADE)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GRADE)!.split(',').forEach((e) => {
        mygrades.push(Number(e));
      });
    }
    const mysubjects : Array<number> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SUBJECT)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SUBJECT)!.split(',').forEach((e) => {
        mysubjects.push(Number(e));
      });
    }
    const mycoreelements : Array<string> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREPCOREELEMENTSIDS)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREPCOREELEMENTSIDS)!.split(',').forEach((e) => {
        mycoreelements.push(e);
      });
    }
    const mytopics : Array<string> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREPMAINTOPICSIDS)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREPMAINTOPICSIDS)!.split(',').forEach((e) => {
        mytopics.push(e);
      });
    }
    const mygoalss : Array<string> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREEPGOALSIDS)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.GREEPGOALSIDS)!.split(',').forEach((e) => {
        mygoalss.push(e);
      });
    }
    const mysources : Array<number> = [];
    if (QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SOURCE)) {
      QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SOURCE)!.split(',').forEach((e) => {
        mysources.push(Number(e));
      });
    }
    const basicpaged = QueryStringHelper.getNumber(this.props.history, QueryStringKeysSearch.PAGE);
    const paged = (basicpaged) ? basicpaged : 1;
    const basiclang = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.LANG);
    const currentLocale = this.storageInteractor.getCurrentLocale();
    const lang = (basiclang) ? basiclang : (currentLocale) ? currentLocale : 'nb';
    this.props.searchStore!.myfilter.page = paged;
    this.props.searchStore!.myfilter.localeId = lang;
    this.props.searchStore!.myfilter.grades = mygrades;
    this.props.searchStore!.myfilter.subjects = mysubjects;
    this.props.searchStore!.myfilter.coreElements = mycoreelements;
    this.props.searchStore!. myfilter.topics = mytopics;
    this.props.searchStore!.myfilter.goals = mygoalss;
    this.props.searchStore!.myfilter.sources = mysources;
    this.props.searchStore!.myfilter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
  }

  public handerScroll = async () => {
    const { myfilter, paginationTotalPages } = this.props.searchStore!;
    const IDHtml = document.getElementById('searchListInfo')! as HTMLElement;
    let searchItemsStet = this.state.searchItems as Array<Search>;
    if (IDHtml.scrollHeight - Math.abs(IDHtml.scrollTop) === IDHtml.clientHeight) {
      myfilter.page = myfilter.page! + 1;
      if (myfilter.page < paginationTotalPages + 1) {
        const mypage = this.props.searchStore!.myfilter.page;
        QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, mypage!);
        this.myFilters();
        const dataSearch = await this.props.searchStore!.getDataSearch();
        searchItemsStet = searchItemsStet.concat(dataSearch.items!);
        this.setState({
          searchItems : searchItemsStet
        });
        /*this.getDataSearchComponents();
        const dataSearch = await this.props.searchStore!.getDataSearch();
        this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
        this.props.searchStore!.getFilters = dataSearch.filters;
        searchItemsStet = searchItemsStet.concat(dataSearch.items!);
        this.setState({
          searchItems : searchItemsStet
        });*/
      }
    }
  }

  public render() {
    const searchLength = (this.state.searchItems.length > 0) ? true : false;
    if (this.props.isFilter) {
      this.forceUpdate();
    }
    return (
      <div className="contentListSearch" id="searchListInfo">
        {searchLength && this.renderSwitchContentList()}
        {!searchLength && this.renderEmpty()}
      </div>
    );
  }
}

export const SearchComponentList = withRouter(SearchMyList);
