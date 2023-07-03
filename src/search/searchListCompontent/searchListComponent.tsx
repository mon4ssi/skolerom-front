import React, { Component, SyntheticEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import { SearchStore } from '../SearchStore';
import { Search } from '../Search';
import { SearchItemComponent } from '../searchItem/searchItem';
import { DEBOUNCE_TIME } from 'utils/constants';
import { lettersNoEn } from 'utils/lettersNoEn';
import { SortingFilter, StoreState, QueryStringKeys, QueryStringKeysSearch } from 'utils/enums';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import './searchListComponent.scss';

const number2 = 2;
const number3 = 3;

interface SearchProps {
  type : string;
  searchStore?: SearchStore;
}

interface SearchState {
  searchItems: Array<Search>;
  type: string;
}
@inject('searchStore')
@observer
class SearchMyList extends Component<SearchProps & RouteComponentProps, SearchState> {
  public state = {
    searchItems: [],
    type: ''
  };
  public getDataSearchComponents = async () => {
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
    myfilter.lang = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.LANG);
    myfilter.grades = mygrades;
    myfilter.subjects = mysubjects;
    myfilter.coreElements = mycoreelements;
    myfilter.topics = mytopics;
    myfilter.goals = mygoalss;
    myfilter.sources = mysources;
    myfilter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeysSearch.SEARCH);
    return this.props.searchStore!.getDataSearch();
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
  public async componentDidMount() {
    const dataSearch = await this.getDataSearchComponents();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState({
      type: this.props.type,
      searchItems : dataSearch.items
    });
  }
  public render() {
    return (
      <div className="contentListSearch">
        {this.renderSwitchContentList()}
      </div>
    );
  }
}

export const SearchComponentList = withRouter(SearchMyList);
