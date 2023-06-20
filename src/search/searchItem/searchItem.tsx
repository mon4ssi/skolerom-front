import React, { Component, SyntheticEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import debounce from 'lodash/debounce';
import { SearchStore } from '../SearchStore';
import { Search } from '../Search';
import { DEBOUNCE_TIME } from 'utils/constants';
import { lettersNoEn } from 'utils/lettersNoEn';
import { SortingFilter, StoreState, QueryStringKeys } from 'utils/enums';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import './searchItem.scss';

interface SearchProps {
  item: Search;
}

@inject('searchStore')
@observer
class SearchItem extends Component<SearchProps & RouteComponentProps> {
  public render() {
    const {
      featuredImg,
      description,
      title,
      id
    } = this.props.item;
    return (
      <div className="cardInfoItem">
        <div className="cardInfoItem__imagen">
          <img src={featuredImg} />
        </div>
        <div className="cardInfoItem__description">
          <div className="title"><h2>{title}</h2></div>
          <div className="description">{description}</div>
        </div>
      </div>
    );
  }
}

export const SearchItemComponent = withRouter(SearchItem);
