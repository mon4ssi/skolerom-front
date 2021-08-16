import React, { Component, ChangeEvent } from 'react';
import './AssignmentsPage.scss';

import { Route, Switch, Redirect, withRouter, RouteComponentProps, matchPath } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import isNull from 'lodash/isNull';
import classNames from 'classnames';

import { TabNavigation } from 'components/common/TabNavigation/TabNavigation';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { MyAssignments } from './tabs/MyAssignments/MyAssignments';
import { StudentAssignments } from './tabs/StudentAssignments/StudentAssignments';
import { AssignmentAnswerList } from './Evaluation/AssignmentAnswerList';
import { NewAssignmentStore } from './NewAssignment/NewAssignmentStore';
import { StudentEvaluation } from './StudentAssignmentsList/StudentEvaluation/StudentEvaluation';
import { AssignmentListStore } from './AssignmentsList/AssignmentListStore';
import { UserType } from 'user/User';
import { Page404 } from 'components/pages/Page404/Page404';

import { BooleanFilter, SortingFilter, QueryStringKeys } from 'utils/enums';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { lettersNoEn } from 'utils/lettersNoEn';
import { Pagination } from '../../components/common/Pagination/Pagination';

const renderTeacherRedirect = () => <Redirect to="/assignments/all" />;
const renderAllAssignments = () => <MyAssignments typeOfAssignmentsList="all" />;
const renderMyAssignments = () => <MyAssignments typeOfAssignmentsList="my" />;

const renderStudentsAssignments = () => <StudentAssignments />;
const renderStudentEvaluation = () => <StudentEvaluation />;

const renderContentManagerRedirect = () => <Redirect to="/assignments/all" />;
const renderNotFoundPage = () => <div className={'notFoundPage'}><Page404 /></div>;

interface Props extends RouteComponentProps {
  isStudent?: boolean;
  isContentManager?: boolean;
  newAssignmentStore?: NewAssignmentStore;
  assignmentListStore?: AssignmentListStore;
}

const currentUserRole = JSON.parse(localStorage.getItem('USER_DATA') || '{}').role;

const teacherRoutes = (
  <Switch>
    <Route
      path="/assignments"
      exact
      render={renderTeacherRedirect}
    />
    <Route
      path="/assignments/all"
      render={renderAllAssignments}
    />
    <Route
      path="/assignments/my"
      render={renderMyAssignments}
    />
    <Route
      path="/assignments/answers/:entityId"
      component={AssignmentAnswerList}
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
      path="/assignments"
      render={renderStudentsAssignments}
    />
    <Route
      path="/assignments/:id/answer/:answerId/evaluation"
      render={renderStudentEvaluation}
    />
    <Route
      path="/*"
      component={renderNotFoundPage}
    />
  </Switch>
);

const contentManagerRoutes = (
  <Switch>
    <Route
      path="/assignments"
      exact
      render={renderContentManagerRedirect}
    />
    <Route
      path="/assignments/all"
      render={renderAllAssignments}
    />
    <Route
      path="/assignments/my"
      render={renderMyAssignments}
    />
    <Route
      path="/*"
      component={Page404}
    />
  </Switch>
);

const AssignmentsPageRouter = () => (
  <Switch>

    {currentUserRole === UserType.Teacher && teacherRoutes}
    {currentUserRole === UserType.Student && studentRoutes}
    {currentUserRole === UserType.ContentManager && contentManagerRoutes}

    <Route path="/assignments/school" />
    <Route path="/assignments/favorites" />
  </Switch>
);

interface State {
  myValueGrade: number | null;
  myValueSubject: number | null;
  myValueMulti: number | null;
  myValueReading: number | null;
}

@inject('assignmentListStore', 'newAssignmentStore')
@observer
class AssignmentsPageWrapper extends Component<Props, State> {
  public tabNavigationLinks = [
    {
      name: 'All assignments',
      url: '/assignments/all'
    },
    {
      name: 'My assignments',
      url: '/assignments/my'
    },
    /*  {
        name: 'My school',
        url: '/teacher/assignments/school'
      },
      {
        name: 'My favorites',
        url: '/teacher/assignments/favorites'
      }*/
  ];
  constructor(props: Props) {
    super(props);
    this.state = {
      myValueGrade: null,
      myValueSubject: null,
      myValueMulti: null,
      myValueReading: null,
    };
  }
  private handleChangeGrade = (e: ChangeEvent<HTMLSelectElement>) => {
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GRADE,
      Number(e.currentTarget.value) ? e.currentTarget.value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private handleChangeSubject = (e: ChangeEvent<HTMLSelectElement>) => {
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.SUBJECT,
      Number(e.currentTarget.value) ? e.currentTarget.value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private handleChangeSorting = (e: ChangeEvent<HTMLSelectElement>) => {
    const [orderField, order] = e.currentTarget.value.split(' ');
    QueryStringHelper.set(this.props.history, QueryStringKeys.ORDER_FIELD, orderField);
    QueryStringHelper.set(this.props.history, QueryStringKeys.ORDER, order);
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private handleClickGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { assignmentListStore } = this.props;
  }

  private handleChangeIsAnswered = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value;

    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.IS_ANSWERED,
      value === BooleanFilter.FALSE || value === BooleanFilter.TRUE ? value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private handleChangeIsEvaluated = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value;

    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.IS_EVALUATED,
      value === BooleanFilter.FALSE || value === BooleanFilter.TRUE ? value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private handleChangeSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      QueryStringHelper.set(this.props.history, QueryStringKeys.SEARCH, e.currentTarget.value);
      QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    }
  }

  private onChangePage = ({ selected }: { selected: number }) => {
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, selected + 1);
  }

  public createAssignment = async () => {
    const { newAssignmentStore, history } = this.props;

    const id = await newAssignmentStore!
      .createAssigment()
      .then(response => response.id);
    history.push(`/assignments/edit/${id}`);
  }

  public hasTabNavigation = () => !this.props.location.pathname.includes('/assignments/answers') && !this.props.isStudent;

  public renderTabNavigations = () => {
    if (this.hasTabNavigation()) {
      return (
        <TabNavigation
          textMainButton={intl.get('assignments_tabs.new_assignment')}
          onClickMainButton={this.createAssignment}
          tabNavigationLinks={this.tabNavigationLinks}
          sourceTranslation={'assignments_tabs'}
        />
      );
    }
    return null;
  }

  public renderSearchFilter = () => {
    const { isStudent, location } = this.props;
    const exeptionPath = location.pathname.includes('/assignments/answers');
    const evaluationPath = matchPath(location.pathname, {
      path: '/assignments/:id/answer/:answerId/evaluation'
    });

    if (!exeptionPath && isNull(evaluationPath)) {
      return (
        <SearchFilter
          isStudent={isStudent}
          subject
          popularity
          isAssignmentsPathPage
          isAssignmentsListPage
          placeholder={intl.get('assignments search.Search for assignments')}

          // METHODS
          handleChangeSubject={this.handleChangeSubject}
          handleChangeGrade={this.handleChangeGrade}
          handleInputSearchQuery={this.handleChangeSearchQuery}
          handleChangeSorting={this.handleChangeSorting}
          handleChangeAnswerStatus={this.handleChangeIsAnswered}
          handleChangeEvaluationStatus={this.handleChangeIsEvaluated}
          handleClickGrade={this.handleClickGrade}
          // VALUES
          gradeFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE)}
          activityFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.ACTIVITY)}
          subjectFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT)}
          isAnsweredFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_ANSWERED)}
          isEvaluatedFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_EVALUATED)}
          orderFieldFilterValue={isStudent ? SortingFilter.DEADLINE : SortingFilter.CREATION_DATE}
          orderFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER)}
          searchQueryFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH)}
        />
      );
    }
    return null;
  }

  public renderPagination = () => {
    const { assignmentListStore, location } = this.props;
    const pages = assignmentListStore!.paginationTotalPages;
    const evaluationPath = location.pathname.includes('/answer');

    if (evaluationPath) return null;

    if (pages > 1) {
      return (
        <Pagination
          pageCount={pages}
          onChangePage={this.onChangePage}
          page={assignmentListStore!.currentPage}
        />
      );
    }
  }

  public render() {
    const classes = classNames('AssignmentsPage moveListBySearchFilter ', {
      AssignmentsPage_noTabs: !this.hasTabNavigation()
    });

    return (
      <div className={classes}>
        <h1 className="generalTitle">
        {intl.get('assignments search.title')}
        </h1>
        {this.renderTabNavigations()}

        {this.renderSearchFilter()}

        <AssignmentsPageRouter />

        {this.renderPagination()}
      </div>
    );
  }
}

export const AssignmentsPage = withRouter(AssignmentsPageWrapper);
