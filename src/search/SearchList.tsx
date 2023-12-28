import React, { Component, createRef, RefObject, ChangeEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { SearchComponentList } from '../search/searchListCompontent/searchListComponent';
import { SearchFilter } from '../search/searchFilters/searchFilters';
import { SearchStore } from '../search/SearchStore';
import { Search, FilterMeta, SimpleNumberData, SimpleStringData, SimpleStringShortData, SimpleNumberDataTitle } from '../search/Search';
import { WPLENGUAGES } from '../utils/constants';
import { lettersNoEn } from 'utils/lettersNoEn';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { injector } from 'Injector';
import { UserType } from 'user/User';
import { UserService } from 'user/UserService';
import { BooleanFilter, SortingFilter, QueryStringKeysSearch, StoreState } from 'utils/enums';
import { DEBOUNCE_TIME, postperpage } from 'utils/constants';
import { StorageInteractor, STORAGE_INTERACTOR_KEY } from '../utils/storageInteractor';
import { parseQueryString } from 'utils/queryString';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';

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
import resetImg from 'assets/images/reset-icon.svg';

import './Search.scss';
const number2 = 2;
const number3 = 3;
const number13 = 13;
const number500 = 500;
const TEACHING_PATHS_PER_PAGE_IN_LIST = postperpage;

interface SearchProps {
  searchStore?: SearchStore;
  type : string;
}

interface SearchState {
  type : string;
  searchQueryValue : string;
  filtersModalTp: boolean;
  filterModalLang: boolean;
  filterModalLangsInside: boolean;
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
  langFilters: Array<string>;
  langFiltersUsed: Array<string>;
  langWpFilters: Array<SimpleStringShortData>;
  allButton: boolean;
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
    filterModalLangsInside : false,
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
    myreading: [],
    langFilters: [],
    langFiltersUsed: [],
    langWpFilters: [],
    allButton: true
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
    const lang = (basicLang) ? basicLang : String(this.state.langFilters);
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
    let NewwpLenguajes : Array<SimpleStringShortData> = [];
    const isLangs = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.LANG);
    const idWpLangs: Array<string> = [];
    this.setState({
      usedFiltereds: false
    });
    this.myFilters();
    const dataSearch = await this.props.searchStore!.getDataSearch();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    if (this.props.searchStore!.getFilters) {
      if (this.props.searchStore!.getFilters!.locales) {
        this.props.searchStore!.getFilters!.locales!.forEach((locale) => {
          WPLENGUAGES.forEach((wp) => {
            if (locale === wp.id) {
              NewwpLenguajes.push(wp);
            }
          });
        });
      } else {
        NewwpLenguajes = WPLENGUAGES;
      }
    } else {
      NewwpLenguajes = WPLENGUAGES;
    }
    NewwpLenguajes.forEach((wp) => {
      idWpLangs.push(wp.id);
    });
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
        langFilters: (isLangs) ? isLangs.split(',') : idWpLangs,
        langFiltersUsed: ((isLangs && this.arraysSonIguales(isLangs!.split(','), idWpLangs))) ? [] : (isLangs) ? isLangs.split(',') : [],
        allButton : ((isLangs && this.arraysSonIguales(isLangs!.split(','), idWpLangs))) ? true : (isLangs) ? false : true,
        langWpFilters: NewwpLenguajes,
        usedFiltereds: true
      },
      () => {
        if (isLangs && isLangs.includes('en') || isLangs && isLangs.includes('fi') || isLangs && isLangs.includes('kv') || isLangs && isLangs.includes('ru')) {
          if (isLangs && isLangs.includes('en') && isLangs && isLangs.includes('fi') && isLangs && isLangs.includes('kv') && isLangs && isLangs.includes('ru')) {
            this.setState({
              filterModalLangsInside: false
            });
          } else {
            this.setState({
              filterModalLangsInside: true
            });
          }
        } else {
          this.setState({
            filterModalLangsInside: false
          });
        }
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
    const { searchStore } = this.props;
    const isValue = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
    this.setState(
      {
        type : this.props.type,
        searchQueryValue: (isValue !== undefined && isValue !== null) ? isValue : ''
      },
      () => {
        this.featchFilters();
        if (this.searchRef.current) {
          this.searchRef.current.focus();
        }
      }
    );
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
  }

  public resetFiltersLangs  = async () => {
    const filters = this.props.searchStore!.getFilters;
    this.props.searchStore!.resetLangFilters();
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.LANG, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    const idWpLangs: Array<string> = [];
    WPLENGUAGES.forEach((wp) => {
      idWpLangs.push(wp.id);
    });
    this.setState(
      {
        langFilters: [],
        langFiltersUsed: [],
        langWpFilters: WPLENGUAGES,
        useFilters: false,
        filterModalLangsInside: false,
        allButton : true,
      },
      () => {
        this.featchFilters();
      }
    );
  }

  public resetFilters = async () => {
    const filters = this.props.searchStore!.getFilters;
    this.props.searchStore!.resetFilters();
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.LANG, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GRADE, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.SUBJECT, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GREEPGOALSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GREPCOREELEMENTSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GREPMAINTOPICSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.GREPREADINGINSUBJECT, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.SOURCE, '');
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    const idWpLangs: Array<string> = [];
    WPLENGUAGES.forEach((wp) => {
      idWpLangs.push(wp.id);
    });
    this.setState({
      langFilters: idWpLangs,
      langFiltersUsed: [],
      langWpFilters: WPLENGUAGES,
      useFilters: false,
      filterModalLangsInside: false,
      allButton : true,
    });
    this.featchFilters();
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
    const mylangFilters : Array<string> = this.state.langFiltersUsed;
    e.stopPropagation();
    const value = e.currentTarget.value;
    if ((mylangFilters.includes(value))) {
      const index = mylangFilters.indexOf(value);
      mylangFilters.splice(index, 1);
    } else {
      mylangFilters.push(value);
    }
    searchStore!.myfilterLang = String(mylangFilters);
    this.setState({
      langFilters : mylangFilters,
      langFiltersUsed : mylangFilters,
      allButton : (mylangFilters.length === 0) ? true : false
    });
    if (mylangFilters.includes('en') || mylangFilters.includes('fi') || mylangFilters.includes('kv') || mylangFilters.includes('uk') || mylangFilters.includes('ru') || mylangFilters.includes('su')) {
      this.setState({
        filterModalLangsInside: true
      });
    } else {
      this.setState({
        filterModalLangsInside: false
      });
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.LANG,
      value ? String(mylangFilters) : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.featchFilters();
    this.closeFiltersModalTp();
  }

  public itemFilterlang = (item: SimpleStringData) => {
    const { searchStore } = this.props;
    const { langFilters, langFiltersUsed } = this.state;
    const mylangFilters : Array<string> = langFiltersUsed;
    const buttonsClass = (mylangFilters.includes(item.id)) ? 'buttonLang active' : 'buttonLang';
    if (item.id === 'en' || item.id === 'fi' || item.id === 'kv' || item.id === 'su' || item.id === 'ru' || item.id === 'uk') {
      return (
        <button
          value={item.id}
          key={item.id}
          className={buttonsClass}
          onClick={this.changeItemFilterlang}
        >
          {item.name}
        </button>
      );
    }
  }

  public itemFilterlangFilter = (item: SimpleStringShortData) => {
    const { searchStore } = this.props;
    const { langFilters, langFiltersUsed } = this.state;
    const mylangFilters : Array<string> = langFiltersUsed;
    const buttonsClass = (mylangFilters.includes(item.id)) ? 'CreateButton active' : 'CreateButton';
    if (item.id === 'nb' || item.id === 'nn') {
      return (
        <button
          value={item.id}
          key={item.id}
          className={buttonsClass}
          onClick={this.changeItemFilterlang}
        >
          {item.name}
        </button>
      );
    }
  }

  public LangMouseEnter = () => {
    this.setState({ useLang: true });
  }

  public LangMouseLeave = () => {
    this.setState({ useLang: false });
  }

  public getModalFilterLenguajes = () => {
    const { searchStore } = this.props;
    const NewwpLenguajes : Array<SimpleStringData> = this.state.langWpFilters;
    return (
      <div className="modalFilterLenguagesContent absModalTinker" onMouseEnter={this.LangMouseEnter} onMouseLeave={this.LangMouseLeave}>
        {NewwpLenguajes.map(this.itemFilterlang)}
      </div>
    );
  }

  public arraysSonIguales = (arr1: Array<String>, arr2: Array<String>)  => {
    if (arr1.length !== arr2.length) {
      return false;
    }
    const sortedArr1 = arr1.slice().sort();
    const sortedArr2 = arr2.slice().sort();
    for (let i = 0; i < sortedArr1.length; i += 1) {
      if (sortedArr1[i] !== sortedArr2[i]) {
        return false;
      }
    }
    return true;
  }

  public changeItemAllButton = () => {
    const { searchStore } = this.props;
    const idWpLangs: Array<string> = [];
    WPLENGUAGES.forEach((wp) => {
      idWpLangs.push(wp.id);
    });
    searchStore!.myfilterLang = String(idWpLangs);
    this.setState({
      langFilters : idWpLangs,
      langFiltersUsed : [],
      allButton : true,
      filterModalLangsInside: false
    });
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeysSearch.LANG,
      String(idWpLangs)
    );
    QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
    this.featchFilters();
    this.closeFiltersModalTp();
  }

  public allLangButton = () => {
    const { allButton } = this.state;
    const idWpLangs: Array<string> = [];
    WPLENGUAGES.forEach((wp) => {
      idWpLangs.push(wp.id);
    });
    const buttonsClass = (allButton) ? 'CreateButton active' : 'CreateButton';
    return (
      <button
        className={buttonsClass}
        onClick={this.changeItemAllButton}
      >
        {intl.get('generals.languageall')}
      </button>
    );
  }

  public preloadOnLang = () => (<SkeletonLoader className="SearchListItem__skeleton" />);

  public modalFilterlang = () => {
    const { searchStore } = this.props;
    const NewwpLenguajes : Array<SimpleStringShortData> = this.state.langWpFilters;
    const ifNewWp = (NewwpLenguajes.length === 0) ? true : false;
    const classbtnlang = this.state.filterModalLangsInside ? 'CreateButton active' : 'CreateButton';
    return (
      <div className="listLenguagesComplete">
        <div className="allSpark">
          {intl.get('generals.languageall')}
        </div>
        <div className="listLenguajes" >
          {ifNewWp && this.preloadOnLang()}
          {!ifNewWp && NewwpLenguajes.map(this.itemFilterlangFilter)}
        </div>
        <div className="listLenguajesList" >
          <a href="javascript:void(0)" className={classbtnlang} onClick={this.openFiltersModalLang} onMouseEnter={this.LangMouseEnter} onMouseLeave={this.LangMouseLeave}>
            <img src={langIcon} />
            {intl.get('generals.languagesimple')}
          </a>
          {this.state.filterModalLang && this.getModalFilterLenguajes()}
        </div>
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

  public Skeleton = () => {
    const SkeletonArray: Array<number> = new Array(TEACHING_PATHS_PER_PAGE_IN_LIST).fill(0);
    return SkeletonArray.map((item, index) => (
      <SkeletonLoader
        key={index}
        className="SearchListItem__skeleton"
      />
    ));
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
    const placeholder = intl.get('assignments search.Search');
    const langText = intl.get('publishing_page.languages');
    const classInsideBody = (this.props.type === 'ARTICLE' || this.props.type === 'TEACHING-PATH') ? (!this.state.usedFiltereds) ? 'SearchPage__body body_ARTICLES' : 'SearchPage__body' : 'SearchPage__body';
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
              {this.modalFilterlang()}
              <a href="javascript:void(0)" className={classbtnText} onClick={this.openFiltersModalTp}>
                <img src={filterIcon} />
                {btnText}
              </a>
            </div>
          </div>
          <div className="SearchPage__header__bottom">
            <div className="SearchPage__header__bottom__left">
              {this.renderTabs()}
            </div>
            <div className="SearchPage__header__bottom__right">
              <button id="ButtonCloseTpInside" onClick={this.resetFiltersLangs}>
                <img src={langIcon} />
                <span>{intl.get('generals.resetall')}</span>
              </button>
            </div>
          </div>
        </div>
        <div className={classInsideBody} ref={this.refBody}>
          {this.state.usedFiltereds && <SearchComponentList items={this.state.items} isFilter={this.state.isFilter} type={this.props.type} />}
          {!this.state.usedFiltereds && this.Skeleton()}
        </div>
        {this.state.filtersModalTp && this.filters()}
      </div>
    );
  }
}

export const SearchList = withRouter(SearchMyList);
