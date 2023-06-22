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
import { SortingFilter, StoreState, QueryStringKeys } from 'utils/enums';
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
}
@inject('searchStore')
@observer
class SearchMyList extends Component<SearchProps & RouteComponentProps, SearchState> {
  public state = {
    searchItems: []
  };
  public getDataSearchComponents = async () => {
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
    // locale
    // page
    // perpage
    return this.props.searchStore!.getDataSearch();
  }
  public renderContentList(item : Search) {
    return (
        <div key={item.id} className="Inside">
            <SearchItemComponent item={item} />
        </div>
    );
  }
  public async componentDidMount() {
    const dataSearch = await this.getDataSearchComponents();
    this.props.searchStore!.paginationTotalPages = dataSearch.totalpage;
    this.props.searchStore!.getFilters = dataSearch.filters;
    this.setState({
      searchItems : dataSearch.items
    });
  }
  public render() {
    const { searchItems } = this.state;
    return (
      <div className="contentListSearch">
        {searchItems.map(this.renderContentList)}
      </div>
    );
  }
}

export const SearchComponentList = withRouter(SearchMyList);
