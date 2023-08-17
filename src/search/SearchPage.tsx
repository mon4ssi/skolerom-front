import React, { Component, createRef } from 'react';
import { Redirect, Route, Switch, withRouter, RouteComponentProps } from 'react-router-dom';
import { UserType } from 'user/User';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { Page404 } from '../components/pages/Page404/Page404';
import { SearchList } from './SearchList';
import './Search.scss';

const currentUserRole = JSON.parse(localStorage.getItem('USER_DATA') || '{}').role;

const renderArticleSearchList = () => <SearchList type="ARTICLE" key="1"/>;
const renderTPSearchList = () => <SearchList type="TEACHING-PATH" key="2"/>;
const renderAssignmentSearchList = () => <SearchList type="ASSIGNMENT" key="3"/>;
const renderContentManagerRedirect = () => <Redirect to="/search/article" />;

const allRoutes = (
  <Switch>
    <Route
      exact
      path="/search"
      render={renderContentManagerRedirect}
    />
    <Route
      path="/search/article"
      render={renderArticleSearchList}
    />
    <Route
      path="/search/teaching-path"
      render={renderTPSearchList}
    />
    <Route
      path="/search/assignment"
      render={renderAssignmentSearchList}
    />
    <Route
      path="/*"
      component={Page404}
    />
  </Switch>
);

const SearchRouter = () => (
    <Switch>
      {currentUserRole === UserType.Teacher && allRoutes}
      {currentUserRole === UserType.Student && allRoutes}
      {currentUserRole === UserType.ContentManager && allRoutes}
    </Switch>
);

class Search extends Component<RouteComponentProps> {
  public render() {
    return (
      <SearchRouter />
    );
  }
}

export const SearchPage = withRouter(Search);
