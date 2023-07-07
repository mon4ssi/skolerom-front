import React, { Component, createRef, RefObject, ChangeEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { SearchComponentList } from '../search/searchListCompontent/searchListComponent';
import { SearchFilter } from '../search/searchFilters/searchFilters';
import { SearchStore } from '../search/SearchStore';
import { WPLENGUAGES } from '../utils/constants';
import { lettersNoEn } from 'utils/lettersNoEn';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { BooleanFilter, SortingFilter, QueryStringKeysSearch, StoreState } from 'utils/enums';

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

import './Search.scss';
const number2 = 2;
interface SearchProps {
  searchStore?: SearchStore;
  type : string;
}

interface SearchState {
  type : string;
  searchQueryValue : string;
  filtersModalTp: boolean;
  filterModalLang: boolean;
  useFilters: boolean;
  isFilter: boolean;
}

@inject('searchStore')
@observer
class SearchMyList extends Component<SearchProps & RouteComponentProps, SearchState> {
  private searchRef: RefObject<HTMLInputElement> = React.createRef();
  public state = {
    filtersModalTp : false,
    filterModalLang : false,
    useFilters: false,
    type : 'ARTICLE',
    searchQueryValue : '',
    isFilter: false
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

  public changeView = (url : string, type: string) => {
    this.setState({
      type
    });
    this.props.history.push(url);
  }

  public async componentDidMount() {
    this.setState({
      type : this.props.type
    });
    if (this.searchRef.current) {
      this.searchRef.current.focus();
    }
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
    this.setState({
      isFilter: true
    });
  }
  public onSearchEnd = () => {
    this.setState({
      isFilter: false
    });
  }

  public filters = () => (
    <div className="fixedsModal">
      <SearchFilter onSearch={this.onSearch} onSearchEnd={this.onSearchEnd}/>
      <div className="filtersModalBackground" onClick={this.closeFiltersModalTp} />
    </div>
  )

  public changeItemFilterlang = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { searchStore } = this.props;
    const value = e.currentTarget.value;
    searchStore!.myfilterLang = value;
    searchStore!.myfilter.lang = value;
    this.setState({
      isFilter: true
    });
    await searchStore!.getDataSearch();
    this.setState({
      isFilter: false
    });
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

  public modalFilterlang = () => {
    const { searchStore } = this.props;
    return (
      <div className="absModalTinker">
        {WPLENGUAGES.map(this.itemFilterlang)}
      </div>
    );
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
      {this.tabNavigationLinks.map(this.renderTabsInside)}
    </div>
  )

  public handleInputSearchQuery = async (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (lettersNoEn(val)) {
      this.setState({ searchQueryValue: e.target.value });
      if (val.length > number2) {
        QueryStringHelper.set(this.props.history, QueryStringKeysSearch.SEARCH, val);
        QueryStringHelper.set(this.props.history, QueryStringKeysSearch.PAGE, 1);
        this.props.searchStore!.myfilter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
        this.setState({
          isFilter: true
        });
        await this.props.searchStore!.getDataSearch();
        this.setState({
          isFilter: false
        });
      }
    }
  }

  public render() {
    const btnText = this.props.searchStore!.useFilters ? intl.get('edit_teaching_path.modals.search.buttons.button_open') : intl.get('edit_teaching_path.modals.search.buttons.button_close');
    const classbtnText = this.props.searchStore!.useFilters ? 'CreateButton active' : 'CreateButton';
    const classbtnlang = this.state.filterModalLang ? 'CreateButton active' : 'CreateButton';
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
                aria-labelledby="searchfilterInput"
                id="SendFilter"
                aria-required="true"
                aria-invalid="false"
                ref={this.searchRef}
              />
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
        <div className="SearchPage__body">
          <SearchComponentList isFilter={this.state.isFilter} type={this.state.type}/>
        </div>
        {this.state.filtersModalTp && this.filters()}
      </div>
    );
  }
}

export const SearchList = withRouter(SearchMyList);
