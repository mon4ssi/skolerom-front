import React, { Component } from 'react';
import { Redirect, Route, Switch, withRouter, RouteComponentProps } from 'react-router-dom';
import { UserType } from 'user/User';

import { TeachingPathsList } from './TeachingPathsList/TeachingPathsList';
import { Page404 } from '../../components/pages/Page404/Page404';
import { TeachingPathAnswersList } from './Evaluation/TeachingPathAnswersList';
import { StudentEvaluation } from './Evaluation/StudentEvaluation/StudentEvaluation';

const renderRedirect = () => <Redirect to="/teaching-paths/all" />;
const renderAllTeachingPaths = () => <TeachingPathsList typeOfTeachingPathsList="all" isNotStudent/>;
const renderMyTeachingPaths = () => <TeachingPathsList typeOfTeachingPathsList="my" isNotStudent />;
const renderMySchoolTeachingPaths = () => <TeachingPathsList typeOfTeachingPathsList="school" isNotStudent />;
const renderInReviewTeachingPaths = () => <TeachingPathsList typeOfTeachingPathsList="inreview" isNotStudent />;

const renderStudentTeachingPaths = () => <TeachingPathsList readOnly />;
const renderStudentEvaluation = () => <StudentEvaluation />;

const renderContentManagerRedirect = () => <Redirect to="/teaching-paths/all" />;

const currentUserRole = JSON.parse(localStorage.getItem('USER_DATA') || '{}').role;

const contentManagerRoutes = (
  <Switch>
    <Route
      exact
      path="/teaching-paths"
      render={renderContentManagerRedirect}
    />
    <Route
      path="/teaching-paths/all"
      render={renderAllTeachingPaths}
    />
    <Route
      path="/teaching-paths/my"
      render={renderMyTeachingPaths}
    />
    <Route
      path="/teaching-paths/inreview"
      render={renderInReviewTeachingPaths}
    />
    <Route
      path="/*"
      component={Page404}
    />
  </Switch>
);

const teacherRoutes = (
  <Switch>
    <Route
      exact
      path="/teaching-paths"
      render={renderRedirect}
    />
    <Route
      path="/teaching-paths/all"
      render={renderAllTeachingPaths}
    />
    <Route
      path="/teaching-paths/my"
      render={renderMyTeachingPaths}
    />
    <Route
      path="/teaching-paths/myschool"
      render={renderMySchoolTeachingPaths}
    />
    <Route
      path="/teaching-paths/answers/:entityId"
      component={TeachingPathAnswersList}
    />
    <Route
      path="/*"
      component={Page404}
    />
  </Switch>
);

const studentRoutes = (
  <Switch>
    <Route
      exact
      path="/teaching-paths"
      render={renderStudentTeachingPaths}
    />
    <Route
      path="/teaching-paths/:id/answer/:answerId/evaluation"
      render={renderStudentEvaluation}
    />
    <Route
      path="/*"
      component={Page404}
    />
  </Switch>
);

const TeachingPathsRouter = () => (
  <Switch>
    {currentUserRole === UserType.Teacher && teacherRoutes}
    {currentUserRole === UserType.Student && studentRoutes}
    {currentUserRole === UserType.ContentManager && contentManagerRoutes}
  </Switch>
);

interface Props extends RouteComponentProps {
  isStudent?: boolean;
  isContentManager?: boolean;
}

class TeachingPathsComponent extends Component<Props> {
  public render() {
    return (
      <TeachingPathsRouter />
    );
  }
}

export const TeachingPathsPage = withRouter(TeachingPathsComponent);
