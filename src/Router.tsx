import React from 'react';
import { Redirect, Route, Switch, RouteComponentProps } from 'react-router-dom';

import { ActivityPage } from './activity/ActivityPage';
import { AssignmentsPage } from 'assignment/view/AssignmentsPage';
import { TeachingPathsPage } from 'teachingPath/view/TeachingPathsPage';
import { StudentsListPage } from 'student/view/StudentsListPage';
import { UserType } from 'user/User';
import { EvaluationPage } from 'evaluation/EvaluationPage/EvaluationPage';
import { AssignmentDistributeList } from 'evaluation/EvaluationPage/AssignmentDistributeList';
import { TeachingPathDistributeList } from 'evaluation/EvaluationPage/TeachingPathDistributeList';
import { Page404 } from './components/pages/Page404/Page404';

const AssignmentsPageComponent = () => <AssignmentsPage isStudent />;
const TeachingPathsPageComponent = () => <TeachingPathsPage isStudent />;

const ContentManagerAssignments = () => <AssignmentsPage isContentManager />;
const ContentManagerTeachingPaths = () => <TeachingPathsPage isContentManager />;

const EvaluationRedirect = (props: RouteComponentProps) => <Redirect to={`/evaluation/assignments${props.location.search}`} />;
const ActivityRedirect = () => <Redirect to={'/activity'} />;

const EvaluationPageRoutes = () => (
  <EvaluationPage>
    <Switch>
      <Route
        exact
        path="/evaluation"
        component={EvaluationRedirect}
      />
      <Route
        path="/evaluation/assignments"
        component={AssignmentDistributeList}
      />
      <Route
        path="/evaluation/teaching-paths"
        component={TeachingPathDistributeList}
      />
      <Route
        path="/*"
        component={Page404}
      />
    </Switch>
  </EvaluationPage>
);

const currentUserRole = JSON.parse(localStorage.getItem('USER_DATA') || '{}').role;

export const Router = () => {
  const teacherRoutes = (
    <Switch>
      <Route
        exact
        path="/"
        component={ActivityRedirect}
      />
      <Route path="/activity">
        <ActivityPage role={UserType.Teacher}/>
      </Route>
      <Route
        path="/assignments"
        component={AssignmentsPage}
      />
      <Route
        path="/teaching-paths"
        component={TeachingPathsPage}
      />
      <Route
        path="/students"
        component={StudentsListPage}
      />
      <Route
        path="/evaluation"
        render={EvaluationPageRoutes}
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
        path="/"
        component={ActivityRedirect}
      />
      <Route path="/activity">
        <ActivityPage role={UserType.Student}/>
      </Route>
      <Route
        path="/teaching-paths"
        component={TeachingPathsPageComponent}
      />
      <Route
        path="/assignments"
        component={AssignmentsPageComponent}
      />
      <Route
        path="/*"
        component={Page404}
      />
    </Switch>
  );

  const contentManagerRoutes = (
    <Switch>
      <Route
        exact
        path="/"
        component={ActivityRedirect}
      />
      <Route path="/activity">
        <ActivityPage role={UserType.ContentManager}/>
      </Route>
      <Route
        path="/assignments"
        component={ContentManagerAssignments}
      />
      <Route
        path="/teaching-paths"
        component={ContentManagerTeachingPaths}
      />
      <Route
        path="/*"
        component={Page404}
      />
    </Switch>
  );

  return (
    <Switch>
      {currentUserRole === UserType.Teacher && teacherRoutes}
      {currentUserRole === UserType.Student && studentRoutes}
      {currentUserRole === UserType.ContentManager && contentManagerRoutes}
    </Switch>
  );
};
