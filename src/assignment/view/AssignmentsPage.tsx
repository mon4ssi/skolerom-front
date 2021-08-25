import React, { Component, ChangeEvent } from 'react';
import './AssignmentsPage.scss';

import { Route, Switch, Redirect, withRouter, RouteComponentProps, matchPath } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import isNull from 'lodash/isNull';
import classNames from 'classnames';

import { TabNavigation } from 'components/common/TabNavigation/TabNavigation';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { GreepSelectValue, FilterGrep, Greep, GrepFilters, GoalsData } from 'assignment/Assignment';
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

const MAGICNUMBER100 = -1;
const MAGICNUMBER1 = 1;
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
  myValueCore: Array<any>;
  myValueGoal: Array<any>;
  goalValueFilter: Array<any>;
  customCoreList: Array<GreepSelectValue>;
  grepFiltersData: FilterGrep;
  optionsCore: Array<GreepSelectValue>;
  optionsMulti: Array<Greep>;
  optionsReading: Array<Greep>;
  optionsSubjects: Array<GrepFilters>;
  optionsGrades: Array<GrepFilters>;
  optionsGoals: Array<GreepSelectValue>;
  valueCoreOptions: Array<number>;
  valueMultiOptions: Array<number>;
  valuereadingOptions: number;
  valueGradesOptions: Array<number>;
  valueSubjectsOptions: Array<number>;
  valueGoalsOptions: Array<number>;
  valueStringGoalsOptions: Array<string>;
  filtersisUsed: boolean;
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
      myValueCore: [],
      myValueGoal: [],
      goalValueFilter: [],
      customCoreList: [],
      grepFiltersData: {},
      optionsCore: [],
      optionsMulti: [],
      optionsReading: [],
      optionsSubjects: [],
      optionsGrades: [],
      optionsGoals: [],
      valueCoreOptions: [],
      valueMultiOptions: [],
      valuereadingOptions: 0,
      valueGradesOptions: [],
      valueSubjectsOptions: [],
      valueGoalsOptions: [],
      valueStringGoalsOptions: [],
      filtersisUsed: false,
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
    const { newAssignmentStore } = this.props;
    const { optionsGrades, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    let valueToArray = 0;
    optionsGrades!.forEach((element) => {
      if (Number(element.wp_id) === Number(e.currentTarget.value)) {
        this.setState({ valueGradesOptions: [element.id] });
        valueToArray = element.id;
      }
    });
    if (this.state.myValueGrade === Number(e.currentTarget.value)) {
      QueryStringHelper.set(
        this.props.history,
        QueryStringKeys.GRADE,
        ''
      );
      this.setState(
        {
          myValueGrade : null
        },
        () => {
          if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
            this.setState({ filtersisUsed: true });
          } else {
            this.setState({ filtersisUsed: false });
          }
        }
      );
    } else {
      QueryStringHelper.set(
        this.props.history,
        QueryStringKeys.GRADE,
        Number(e.currentTarget.value) ? e.currentTarget.value : ''
      );
      this.setState({
        myValueGrade : Number(e.currentTarget.value)
      });
      this.setState({ filtersisUsed: true });
    }
    const grepFiltergoalssDataAwait = await newAssignmentStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, [valueToArray], valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private handleClickSubject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { newAssignmentStore } = this.props;
    const { optionsSubjects, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const value = e.currentTarget.value;
    let valueToArray = 0;
    optionsSubjects!.forEach((element) => {
      if (Number(element.wp_id) === Number(e.currentTarget.value)) {
        this.setState({ valueSubjectsOptions: [element.id] });
        valueToArray = element.id;
      }
    });
    if (this.state.myValueSubject === Number(e.currentTarget.value)) {
      QueryStringHelper.set(
        this.props.history,
        QueryStringKeys.SUBJECT,
        ''
      );
      this.setState(
        {
          myValueSubject : null
        },
        () => {
          if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
            this.setState({ filtersisUsed: true });
          } else {
            this.setState({ filtersisUsed: false });
          }
        }
      );
    } else {
      QueryStringHelper.set(
        this.props.history,
        QueryStringKeys.SUBJECT,
        Number(e.currentTarget.value) ? e.currentTarget.value : ''
      );
      this.setState({
        myValueSubject : Number(e.currentTarget.value)
      });
      this.setState({ filtersisUsed: true });
    }
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    const grepFiltergoalssDataAwait = await newAssignmentStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, valueGradesOptions, [valueToArray], this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
  }

  private handleClickMulti = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { newAssignmentStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    if (this.state.myValueMulti) {
      QueryStringHelper.set(
        this.props.history,
        QueryStringKeys.GREPMAINTOPICSIDS,
        ''
      );
      this.setState(
        {
          myValueMulti : null
        },
        () => {
          if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
            this.setState({ filtersisUsed: true });
          } else {
            this.setState({ filtersisUsed: false });
          }
        }
      );
    } else {
      QueryStringHelper.set(
        this.props.history,
        QueryStringKeys.GREPMAINTOPICSIDS,
        Number(e.currentTarget.value) ? e.currentTarget.value : ''
      );
      this.setState({
        myValueMulti : Number(e.currentTarget.value)
      });
      this.setState({ filtersisUsed: true });
    }
    this.setState({ valueMultiOptions: [Number(e.currentTarget.value)] });
    const grepFiltergoalssDataAwait = await newAssignmentStore!.getGrepGoalsFilters(valueCoreOptions, [Number(e.currentTarget.value)], valueGradesOptions, valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private handleClickReading = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (this.state.myValueReading) {
      QueryStringHelper.set(
        this.props.history,
        QueryStringKeys.GREPREADINGINSUBJECT,
        ''
      );
      this.setState(
        {
          myValueReading : null
        },
        () => {
          if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
            this.setState({ filtersisUsed: true });
          } else {
            this.setState({ filtersisUsed: false });
          }
        }
      );
    } else {
      QueryStringHelper.set(
        this.props.history,
        QueryStringKeys.GREPREADINGINSUBJECT,
        Number(e.currentTarget.value) ? e.currentTarget.value : ''
      );
      this.setState({
        myValueReading : Number(e.currentTarget.value)
      });
      this.setState({ filtersisUsed: true });
    }
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private handleChangeSelectCore = async (newValue: Array<any>) => {
    const ArrayValue: Array<number> = [];
    const { newAssignmentStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    this.setState(
      {
        myValueCore : newValue
      },
      () => {
        if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
          this.setState({ filtersisUsed: true });
        } else {
          this.setState({ filtersisUsed: false });
        }
      }
    );
    newValue.forEach((e) => {
      ArrayValue.push(e.value);
    });
    this.setState({ valueCoreOptions: ArrayValue });
    const grepFiltergoalssDataAwait = await newAssignmentStore!.getGrepGoalsFilters(ArrayValue, valueMultiOptions, valueGradesOptions, valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
    let singleString : string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
      });
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GREPCOREELEMENTSIDS,
      singleString
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  private handleChangeSelectGoals = async (newValue: Array<any>) => {
    const ArrayValue: Array<number> = [];
    this.setState(
      {
        myValueGoal : newValue
      },
      () => {
        if (this.state.myValueSubject || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti || this.state.myValueReading || this.state.myValueGrade) {
          this.setState({ filtersisUsed: true });
        } else {
          this.setState({ filtersisUsed: false });
        }
      }
    );
    newValue.forEach((e) => {
      ArrayValue.push(e.value);
    });
    this.setState({ valueGoalsOptions: ArrayValue });
    let singleString : string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
      });
    }
    this.setState({ goalValueFilter: newValue });
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GREEPGOALSIDS,
      singleString
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
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

  public renderValueOptions = (data: FilterGrep, type: string) => {
    const returnArray : Array<GreepSelectValue> = [];
    if (type === 'core') {
      data!.coreElementsFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'multi') {
      data!.mainTopicFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'reading') {
      data!.readingInSubjects!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.name
        });
      });
    }
    return returnArray;
  }

  public renderValueOptionsNumbers = (data: FilterGrep, type: string) => {
    const returnArray : Array<Greep> = [];
    if (type === 'multi') {
      data!.mainTopicFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          id: Number(element.id),
          title: element.description
        });
      });
    }
    if (type === 'reading') {
      data!.readingInSubjects!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          id: Number(element.id),
          title: element.name
        });
      });
    }
    return returnArray;
  }

  public renderValueOptionsBasics = (data: FilterGrep, type: string) => {
    const returnArray : Array<GrepFilters> = [];
    if (type === 'subject') {
      data!.subjectFilters!.forEach((element) => {
        returnArray.push({
          id: Number(element.id),
          name: element.name,
          // tslint:disable-next-line: variable-name
          wp_id: element.wp_id
        });
      });
    }
    if (type === 'grade') {
      data!.gradeFilters!.forEach((element) => {
        returnArray.push({
          id: Number(element.id),
          name: element.name,
          // tslint:disable-next-line: variable-name
          wp_id: element.wp_id
        });
      });
    }
    return returnArray;
  }

  public renderValueOptionsGoals = (data: Array<GoalsData>) => {
    const returnArray : Array<GreepSelectValue> = [];
    data!.forEach((element) => {
      returnArray.push({
        // tslint:disable-next-line: variable-name
        value: Number(element.id),
        label: element.description!
      });
    });
    return returnArray;
  }

  public fetchTeachingPaths() {
    const { filter } = this.props.assignmentListStore!;

    filter.page = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE, 1);
    filter.grade = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE);
    filter.subject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT);
    filter.grepCoreElementsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS);
    filter.grepMainTopicsIds = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS);
    filter.grepGoalsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREEPGOALSIDS);
    filter.grepReadingInSubject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT);
    filter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH);
    filter.order = QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER, SortingFilter.DESC);
    filter.orderField = SortingFilter.CREATION_DATE;

    if (filter.subject || filter.grade || filter.grepCoreElementsIds || filter.grepMainTopicsIds || filter.grepGoalsIds || filter.grepReadingInSubject) {
      this.setState({ filtersisUsed: true });
    } else {
      this.setState({ filtersisUsed: false });
    }
  }

  public async componentDidMount() {
    const { newAssignmentStore } = this.props;
    const { valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions } = this.state;
    this.fetchTeachingPaths();
    const grepFiltersDataAwait = await newAssignmentStore!.getGrepFilters();
    this.setState({
      grepFiltersData : grepFiltersDataAwait
    });
    this.setState({
      optionsCore : this.renderValueOptions(grepFiltersDataAwait, 'core')
    });
    this.setState({
      optionsMulti : this.renderValueOptionsNumbers(grepFiltersDataAwait, 'multi')
    });
    this.setState({
      optionsReading : this.renderValueOptionsNumbers(grepFiltersDataAwait, 'reading')
    });
    this.setState({
      optionsSubjects : this.renderValueOptionsBasics(grepFiltersDataAwait, 'subject')
    });
    this.setState({
      optionsGrades : this.renderValueOptionsBasics(grepFiltersDataAwait, 'grade')
    });
    const listGoals = [''];
    this.setState({
      valueStringGoalsOptions: listGoals
    });
    const grepFiltergoalssDataAwait = await newAssignmentStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions, listGoals, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
  }

  public handleClickReset = async () => {
    QueryStringHelper.set(this.props.history, QueryStringKeys.GRADE, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.SUBJECT, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.GREEPGOALSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);

    const GradeFilterSubjectArray = Array.from(document.getElementsByClassName('subjectsFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterSubjectArray.forEach((e) => {
      e.classList.remove('active');
    });
    const GradeFilterGradeArray = Array.from(document.getElementsByClassName('gradesFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterGradeArray.forEach((e) => {
      e.classList.remove('active');
    });
    const GradeFilterMultiArray = Array.from(document.getElementsByClassName('multiFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterMultiArray.forEach((e) => {
      e.classList.remove('active');
    });
    const GradeFilterArray = Array.from(document.getElementsByClassName('sourceFilterClass') as HTMLCollectionOf<HTMLElement>);
    GradeFilterArray.forEach((e) => {
      e.classList.remove('active');
    });
    const grepFiltergoalssDataAwait = await this.props.newAssignmentStore!.getGrepGoalsFilters([], [], [], [], [], MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
    this.setState({ valueGradesOptions: [] });
    this.setState({ valueCoreOptions: [] });
    this.setState({ valueMultiOptions: [] });
    this.setState({ filtersisUsed: false });
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
          customCoreTPList={this.state.optionsCore}
          customMultiList={this.state.optionsMulti}
          customReadingList={this.state.optionsReading}
          customGoalsTPList={this.state.optionsGoals}
          filtersisUsed={this.state.filtersisUsed}
          // METHODS
          handleChangeSubject={this.handleChangeSubject}
          handleChangeGrade={this.handleChangeGrade}
          handleInputSearchQuery={this.handleChangeSearchQuery}
          handleChangeSorting={this.handleChangeSorting}
          handleChangeAnswerStatus={this.handleChangeIsAnswered}
          handleChangeEvaluationStatus={this.handleChangeIsEvaluated}
          handleClickGrade={this.handleClickGrade}
          handleClickSubject={this.handleClickSubject}
          handleClickMulti={this.handleClickMulti}
          handleClickReading={this.handleClickReading}
          handleChangeSelectCore={this.handleChangeSelectCore}
          handleChangeSelectGoals={this.handleChangeSelectGoals}
          handleClickReset={this.handleClickReset}
          // VALUES
          gradeFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE)}
          activityFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.ACTIVITY)}
          subjectFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT)}
          isAnsweredFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_ANSWERED)}
          isEvaluatedFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_EVALUATED)}
          orderFieldFilterValue={isStudent ? SortingFilter.DEADLINE : SortingFilter.CREATION_DATE}
          orderFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER)}
          searchQueryFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH)}
          coreValueFilter={this.state.myValueCore}
          goalValueFilter={this.state.goalValueFilter}

          mainFilterValueTP={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS)}
          readingFilterValueTP={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT)}
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
