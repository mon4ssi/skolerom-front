import React, { Component, createRef, RefObject, ChangeEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { SearchComponentList } from '../search/searchListCompontent/searchListComponent';
import { SearchFilter } from '../search/searchFilters/searchFilters';
import { SearchStore } from '../search/SearchStore';
import { Search, FilterMeta, SimpleNumberData, SimpleStringData, SimpleNumberDataTitle } from '../search/Search';
import { WPLENGUAGES } from '../utils/constants';
import { lettersNoEn } from 'utils/lettersNoEn';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { injector } from 'Injector';
import { UserType } from 'user/User';
import { UserService } from 'user/UserService';
import { BooleanFilter, SortingFilter, QueryStringKeysSearch, StoreState } from 'utils/enums';
import { StorageInteractor, STORAGE_INTERACTOR_KEY } from '../utils/storageInteractor';
import { parseQueryString } from 'utils/queryString';

import searchIcon from 'assets/images/search.svg';
import searchPinkIcon from 'assets/images/searchpink.svg';
import filterIcon from 'assets/images/filter.svg';
import langIcon from 'assets/images/lang.svg';
import articleIcon from 'assets/images/article.svg';
import articlePinkIcon from 'assets/images/articlepink.svg';
import tpIcon from 'assets/images/teaching-path.svg';
import tpPinkIcon from 'assets/images/teaching-path-pink.svg';
import assigIcon from 'assets/images/assignment.svg';
import assigPinkIcon from 'assets/images/assignmentpink.svg';
import closeicon from 'assets/images/close-button.svg';

import './Search.scss';
const number2 = 2;
const number3 = 3;
const number13 = 13;
const number500 = 500;
interface SearchProps {
  searchStore?: SearchStore;
  type : string;
}

interface SearchState {
  type : string;
  searchQueryValue : string;
  filtersModalTp: boolean;
  filterModalLang: boolean;
  useLang: boolean;
  useFilters: boolean;
  isFilter: boolean;
  useSearch: boolean;
  usedFiltereds: boolean;
  items: Array<Search>;
  getFilters: FilterMeta;
  mygrades: Array<SimpleNumberData>;
  mysubjects: Array<SimpleNumberData>;
  mycoreElements: Array<SimpleStringData>;
  mytopics: Array<SimpleStringData>;
  mygoals: Array<SimpleStringData>;
  mysource: Array<SimpleNumberDataTitle>;
  myreading: Array<SimpleNumberDataTitle>;
  page: number;
}
export const USER_SERVICE = 'USER_SERVICE';
@inject('searchStore')
@observer
class SearchMyList extends Component<SearchProps & RouteComponentProps, SearchState> {
  private userService: UserService = injector.get<UserService>(USER_SERVICE);
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  private searchRef: RefObject<HTMLInputElement> = React.createRef();
  private refBody: RefObject<HTMLDivElement> = React.createRef();
  public state = {
    filtersModalTp : false,
    filterModalLang : false,
    useLang: false,
    useFilters: false,
    type : 'ARTICLE',
    searchQueryValue : '',
    isFilter: false,
    useSearch: false,
    usedFiltereds: false,
    items: [],
    getFilters: this.props.searchStore!.getFilters!,
    page: 1,
    mygrades: [],
    mysubjects: [],
    mycoreElements: [],
    mytopics: [],
    mygoals: [],
    mysource: [],
    myreading: []
  };
  public tabNavigationLinks = [
    {
      name: 'Articles',
      url: '/search/article',
      icon: articleIcon,
      iconHover: articlePinkIcon,
      data: 'ARTICLE'
    },
    {
      name: 'Teaching Paths',
      url: '/search/teaching-path',
      icon: tpIcon,
      iconHover: tpPinkIcon,
      data: 'TEACHING-PATH'
    },
    {
      name: 'Assignments',
      url: '/search/assignment',
      icon: assigIcon,
      iconHover: assigPinkIcon,
      data: 'ASSIGNMENT'
    }
  ];
  public tabNavigationLinksStudent = [
    {
      name: 'Articles',
      url: '/search/article',
      icon: articleIcon,
      iconHover: articlePinkIcon,
      data: 'ARTICLE'
    }
  ];

  public changeView = (url : string, type: string) => {
    this.setState({
      type
    });
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    if (window.location.search) {
      const myUrl = `${url}${window.location.search}`;
      this.props.history.push(myUrl);
    } else {
      this.props.history.push(url);
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
    const basicPage = QueryStringHelper.getNumber(this.props.history, QueryStringKeysSearch.PAGE);
    const paged = (basicPage) ? basicPage : 1;
    const basicLang = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.LANG);
    const storagelocale = this.storageInteractor.getCurrentLocale();
    const lang = (basicLang) ? basicLang : (storagelocale) ? storagelocale : 'nb' ;
    this.props.searchStore!.myfilter.page = paged;
    this.props.searchStore!.myfilter.localeId = lang;
    this.props.searchStore!.myfilter.grades = mygrades;
    this.props.searchStore!.myfilter.subjects = mysubjects;
    this.props.searchStore!.myfilter.coreElements = mycoreelements;
    this.props.searchStore!.myfilter.topics = mytopics;
    this.props.searchStore!.myfilter.goals = mygoalss;
    this.props.searchStore!.myfilter.sources = mysources;
    this.props.searchStore!.myfilter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
    if (mygrades.length > 0 || mysubjects.length > 0 || mytopics.length > 0 || mycoreelements.length > 0 || mygoalss.length > 0 || mysources.length > 0) {
      this.setState({
        useFilters: true
      });
    }
  }

  public featchFilters = async () => {
    this.setState({
      usedFiltereds: false
    });
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState(
      {
        items: dataSearch.items,
        getFilters: dataSearch.filters,
        mygrades: dataSearch.filters.grades!,
        mysubjects: dataSearch.filters.subjects!,
        mycoreElements: dataSearch.filters.coreElements!,
        mytopics: dataSearch.filters.topics!,
        mygoals: dataSearch.filters.goals!,
        mysource: dataSearch.filters.sources!,
        myreading: dataSearch.filters.readingInSubjects!,
        usedFiltereds: true
      }
    );
  }

  public featchFiltersNew = async () => {
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    let searchItemsStet = this.state.items as Array<Search>;
    searchItemsStet = searchItemsStet.concat(dataSearch.items!);
    this.setState(
      {
        items: searchItemsStet
      },
      () => {
        this.refBody.current!.scrollIntoView({ behavior: 'smooth' });
      }
    );
  }
  public handleClickOutside = () => {
    if (this.state.filterModalLang && !this.state.useLang) {
      this.setState({
        filterModalLang: false
      });
    }
  }
  public componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
    this.setState({
      useFilters : false
    });
  }
  public async componentDidMount() {
    const isValue = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
    this.featchFilters();
    this.setState({
      type : this.props.type,
      searchQueryValue: (isValue !== undefined && isValue !== null) ? isValue : ''
    });
    if (this.searchRef.current) {
      this.searchRef.current.focus();
    }
    document.addEventListener('click', this.handleClickOutside, true);
  }

  public closeFiltersModalTp = () =>  {
    this.setState({
      filtersModalTp: false,
      filterModalLang: false
    });
  }

  public openFiltersModalTp = () => {
    this.setState({
      filtersModalTp: true,
      filterModalLang: false
    });
  }

  public openFiltersModalLang = () => {
    if (this.state.filterModalLang) {
      this.setState({
        filterModalLang: false
      });
    } else {
      this.setState({
        filterModalLang: true
      });
    }
  }

  public onSearch = () => {
    this.featchFilters();
  }

  public onSearchGrades = async () => {
    this.setState({
      usedFiltereds: false
    });
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState(
      {
        items: dataSearch.items,
        getFilters: dataSearch.filters,
        mysubjects: dataSearch.filters.subjects!,
        mycoreElements: dataSearch.filters.coreElements!,
        mytopics: dataSearch.filters.topics!,
        mygoals: dataSearch.filters.goals!,
        mysource: dataSearch.filters.sources!,
        myreading: dataSearch.filters.readingInSubjects!,
        usedFiltereds: true
      }
    );
  }
  public onSearchSubjects = async () => {
    this.setState({
      usedFiltereds: false
    });
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState(
      {
        items: dataSearch.items,
        getFilters: dataSearch.filters,
        mycoreElements: dataSearch.filters.coreElements!,
        mytopics: dataSearch.filters.topics!,
        mygoals: dataSearch.filters.goals!,
        mysource: dataSearch.filters.sources!,
        myreading: dataSearch.filters.readingInSubjects!,
        usedFiltereds: true
      }
    );
  }
  public onSearchElements = async () => {
    this.setState({
      usedFiltereds: false
    });
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState(
      {
        items: dataSearch.items,
        getFilters: dataSearch.filters,
        mytopics: dataSearch.filters.topics!,
        mygoals: dataSearch.filters.goals!,
        mysource: dataSearch.filters.sources!,
        myreading: dataSearch.filters.readingInSubjects!,
        usedFiltereds: true
      }
    );
  }

  public onSearchTopics = async () => {
    this.setState({
      usedFiltereds: false
    });
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState(
      {
        items: dataSearch.items,
        getFilters: dataSearch.filters,
        mygoals: dataSearch.filters.goals!,
        mysource: dataSearch.filters.sources!,
        myreading: dataSearch.filters.readingInSubjects!,
        usedFiltereds: true
      }
    );
  }

  public onSearchGoals = async () => {
    this.setState({
      usedFiltereds: false
    });
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState(
      {
        items: dataSearch.items,
        getFilters: dataSearch.filters,
        mysource: dataSearch.filters.sources!,
        myreading: dataSearch.filters.readingInSubjects!,
        usedFiltereds: true
      }
    );
  }

  public onSearchSource = async () => {
    this.setState({
      usedFiltereds: false
    });
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState(
      {
        items: dataSearch.items,
        getFilters: dataSearch.filters,
        myreading: dataSearch.filters.readingInSubjects!,
        usedFiltereds: true
      }
    );
  }

  public onSearchReading = async () => {
    this.setState({
      usedFiltereds: false
    });
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState(
      {
        items: dataSearch.items,
        getFilters: dataSearch.filters,
        usedFiltereds: true
      }
    );
  }

  public onReset = () => {
    this.setState({
      useFilters: false
    });
    this.props.searchStore!.myfilterLang = this.storageInteractor.getCurrentLocale();
  }

  public filters = () => {
    const { searchStore } = this.props;
    return (
      <div className="fixedsModal">
        <SearchFilter
          visible={this.state.usedFiltereds}
          filters={this.state.getFilters!}
          mygrades={this.state.mygrades}
          mysubjects={this.state.mysubjects}
          mycoreElements={this.state.mycoreElements}
          topics={this.state.mytopics}
          mygoals={this.state.mygoals}
          myreading={this.state.myreading}
          mysource={this.state.mysource}
          onSearchGrades={this.onSearchGrades}
          onSearchSubjects={this.onSearchSubjects}
          onSearchElements={this.onSearchElements}
          onSearchTopics={this.onSearchTopics}
          onSearchSource={this.onSearchSource}
          onSearchGoals={this.onSearchGoals}
          onSearchReading={this.onSearchReading}
          onSearch={this.onSearch}
          resetSearch={this.onReset}
        />
        <div className="filtersModalBackground" onClick={this.closeFiltersModalTp} />
      </div>
    );
  }

  public changeItemFilterlang = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { searchStore } = this.props;
    e.stopPropagation();
    const value = e.currentTarget.value;
    searchStore!.myfilterLang = value;
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.LANG,
      value ? value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.featchFilters();
    this.closeFiltersModalTp();
  }

  public itemFilterlang = (item: any) => {
    const { searchStore } = this.props;
    if (item.id === searchStore!.myfilterLang) {
      return (
        <button
          value={item.id}
          key={item.id}
          className="buttonLang active"
        >
          {item.name}
        </button>
      );
    }
    return (
      <button
        value={item.id}
        key={item.id}
        className="buttonLang"
        onClick={this.changeItemFilterlang}
      >
        {item.name}
      </button>
    );
  }

  public LangMouseEnter = () => {
    this.setState({ useLang: true });
  }

  public LangMouseLeave = () => {
    this.setState({ useLang: false });
  }

  public modalFilterlang = () => {
    const { searchStore } = this.props;
    let NewwpLenguajes : Array<any> = [];
    if (searchStore!.getFilters!.locales) {
      searchStore!.getFilters!.locales!.forEach((locale) => {
        WPLENGUAGES.forEach((wp) => {
          if (locale === wp.id) {
            NewwpLenguajes.push(wp);
          }
        });
      });
    } else {
      NewwpLenguajes = WPLENGUAGES;
    }
    return (
      <div className="absModalTinker" onMouseEnter={this.LangMouseEnter} onMouseLeave={this.LangMouseLeave}>
        {NewwpLenguajes.map(this.itemFilterlang)}
      </div>
    );
  }

  public handerScroll = () => {
    const mypage = this.props.searchStore!.myfilter.page;
    this.setState({ page : mypage! });
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, mypage!);
    this.featchFiltersNew();
  }

  public renderTabsInside = (item : any) => {
    const activeClass = (this.props.type === item.data) ?  'renderTab active' : 'renderTab';
    const icondem = (this.props.type === item.data) ? item.iconHover : item.icon;
    return (
      <a href="javascript:void(0)" className={activeClass} onClick={() => this.changeView(item.url, item.data)}>
        <img src={icondem} />
        {intl.get(`sidebar.${item.name}`)}
      </a>
    );
  }

  public renderTabs = () =>  (
    <div className="renderTabs">
      {(this.userService.getCurrentUser()!.type === UserType.Student) && this.tabNavigationLinksStudent.map(this.renderTabsInside)}
      {!(this.userService.getCurrentUser()!.type === UserType.Student) && this.tabNavigationLinks.map(this.renderTabsInside)}
    </div>
  )

  public handleInputSearchQuery = async (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (lettersNoEn(val)) {
      this.setState({ searchQueryValue: e.target.value });
      if (val.length > number2 || val.length === 0) {
        QueryStringHelper.set(this.props.history, QueryStringKeysSearch.SEARCH, val);
        QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
        this.props.searchStore!.myfilter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
        this.setState({
          useSearch: true
        });
        if (this.state.usedFiltereds) {
          setTimeout(() => {
            this.featchFilters();
          }, number500);
        }
        if (val.length === 0) {
          this.setState({
            useSearch: false
          });
        }
      }
    }
  }
  public handleInputSearchQueryonKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { history } = this.props;
    const val = e.currentTarget.value;
    if (lettersNoEn(val)) {
      this.setState({ searchQueryValue: e.currentTarget.value });
      if (e.key === 'Enter' || e.keyCode === number13) {
        QueryStringHelper.set(this.props.history, QueryStringKeysSearch.SEARCH, val);
        QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
        this.props.searchStore!.myfilter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
        this.setState({
          useSearch: true
        });
        if (val.length === 0) {
          this.setState({
            useSearch: false
          });
        }
        this.featchFilters();
      }
    }
  }

  public cleanSearchInput = async () => {
    if (this.searchRef) {
      this.searchRef.current!.value = '';
      QueryStringHelper.set(this.props.history, QueryStringKeysSearch.SEARCH, '');
      QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
      this.props.searchStore!.myfilter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
      this.featchFilters();
      this.setState({
        searchQueryValue: '',
        useSearch: false
      });
    }
  }

  public render() {
    const btnText = this.state.useFilters ? intl.get('edit_teaching_path.modals.search.buttons.button_open') : intl.get('edit_teaching_path.modals.search.buttons.button_close');
    const classbtnText = this.state.useFilters ? 'CreateButton active' : 'CreateButton';
    const classbtnlang = this.state.filterModalLang ? 'CreateButton active' : 'CreateButton active';
    const placeholder = intl.get('assignments search.Search');
    const langText = intl.get('publishing_page.languages');
    return (
      <div className="SearchPage">
        <div className="SearchPage__header">
          <div className="SearchPage__header__top">
            <div className="SearchPage__header__top__left">
              <img src={searchPinkIcon} />
              <input
                type="text"
                placeholder={placeholder}
                value={this.state.searchQueryValue}
                onChange={this.handleInputSearchQuery}
                onKeyUp={this.handleInputSearchQueryonKeyUp}
                aria-labelledby="searchfilterInput"
                id="SendFilter"
                aria-required="true"
                aria-invalid="false"
                ref={this.searchRef}
              />
              {this.state.useSearch && <img src={closeicon} className="closeIcon" onClick={this.cleanSearchInput}/>}
            </div>
            <div className="SearchPage__header__top__right">
              <a href="javascript:void(0)" className={classbtnText} onClick={this.openFiltersModalTp}>
                <img src={filterIcon} />
                {btnText}
              </a>
              <a href="javascript:void(0)" className={classbtnlang} onClick={this.openFiltersModalLang}>
                <img src={langIcon} />
                {langText}
              </a>
              {this.state.filterModalLang && this.modalFilterlang()}
            </div>
          </div>
          <div className="SearchPage__header__bottom">
            {this.renderTabs()}
          </div>
        </div>
        <div className="SearchPage__body" ref={this.refBody}>
          {this.state.usedFiltereds && <SearchComponentList items={this.state.items} isFilter={this.state.isFilter} type={this.props.type} />}
        </div>
        {this.state.filtersModalTp && this.filters()}
      </div>
    );
  }
}

export const SearchList = withRouter(SearchMyList);
