import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { SearchComponentList } from '../search/searchListCompontent/searchListComponent';
import { SearchFilter } from '../search/searchFilters/searchFilters';

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

interface SearchProps {
  type : string;
}

interface SearchState {
  type : string;
  filtersModalTp: boolean;
}

class SearchMyList extends Component<SearchProps & RouteComponentProps, SearchState> {
  public state = {
    filtersModalTp : false,
    type : 'ARTICLE'
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
  }

  public closeFiltersModalTp = () =>  {
    this.setState({
      filtersModalTp: false
    });
  }

  public openFiltersModalTp = () => {
    this.setState({
      filtersModalTp: true
    });
  }

  public filters = () => (
    <div className="fixedsModal">
      <SearchFilter />
      <div className="filtersModalBackground" onClick={this.closeFiltersModalTp} />
    </div>
  )

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

  public render() {
    const btnText = this.state.filtersModalTp ? intl.get('edit_teaching_path.modals.search.buttons.button_open') : intl.get('edit_teaching_path.modals.search.buttons.button_open');
    const langText = intl.get('publishing_page.languages');
    return (
      <div className="SearchPage">
        <div className="SearchPage__header">
          <div className="SearchPage__header__top">
            <div className="SearchPage__header__top__left">
              <img src={searchPinkIcon} />
              <input type="text"/>
            </div>
            <div className="SearchPage__header__top__right">
              <a href="javascript:void(0)" className="CreateButton" onClick={this.openFiltersModalTp}>
                <img src={filterIcon} />
                {btnText}
              </a>
              <a href="javascript:void(0)" className="CreateButton">
                <img src={langIcon} />
                {langText}
              </a>
            </div>
          </div>
          <div className="SearchPage__header__bottom">
            {this.renderTabs()}
          </div>
        </div>
        <div className="SearchPage__body">
          <SearchComponentList type={this.state.type}/>
        </div>
        {this.state.filtersModalTp && this.filters()}
      </div>
    );
  }
}

export const SearchList = withRouter(SearchMyList);
