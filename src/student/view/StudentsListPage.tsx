import React, { Component } from 'react';
import { withRouter, Route, Redirect, RouteComponentProps, Switch } from 'react-router-dom';

import { StudentsList } from './StudentsList/StudentsList';
import { Page404 } from '../../components/pages/Page404/Page404';

const renderRedirect = () => <Redirect to="/students/my" />;
const renderMyStudentsList = () => <StudentsList currentTab="my" />;
const renderPreviousStudentsList = () => <StudentsList currentTab="previous" />;

const StudentsListRouter = () => (
  <Switch>
    <Route
      exact
      path="/students"
      render={renderRedirect}
    />
    <Route
      path="/students/my"
      render={renderMyStudentsList}
    />
    <Route
      path="/students/previous"
      render={renderPreviousStudentsList}
    />
    <Route
      path="/*"
      component={Page404}
    />
  </Switch>
);

class StudentsListComponent extends Component<RouteComponentProps> {

  public render() {
    return (
      <div style={{ height: '100%' }}>
        <StudentsListRouter />
      </div>
    );
  }
}

export const StudentsListPage = withRouter(StudentsListComponent);
