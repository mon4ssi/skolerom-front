import React, { Component, ChangeEvent } from 'react';
import './AssignmentsPage.scss';

import { Route, Switch, Redirect, withRouter, RouteComponentProps, matchPath } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import isNull from 'lodash/isNull';
import classNames from 'classnames';

import { TabNavigation } from 'components/common/TabNavigation/TabNavigation';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { GreepSelectValue, FilterGrep, Greep, GrepFilters, GoalsData, Subject, Source, Grade } from 'assignment/Assignment';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { MyAssignments } from './tabs/MyAssignments/MyAssignments';
import { StudentAssignments } from './tabs/StudentAssignments/StudentAssignments';
import { AssignmentAnswerList } from './Evaluation/AssignmentAnswerList';
import { NewAssignmentStore } from './NewAssignment/NewAssignmentStore';
import { StudentEvaluation } from './StudentAssignmentsList/StudentEvaluation/StudentEvaluation';
import { AssignmentListStore } from './AssignmentsList/AssignmentListStore';
import { UserType } from 'user/User';
import { Page404 } from 'components/pages/Page404/Page404';

import { BooleanFilter, SortingFilter, QueryStringKeys, StoreState } from 'utils/enums';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { lettersNoEn } from 'utils/lettersNoEn';
import { Pagination } from '../../components/common/Pagination/Pagination';

const MAGICNUMBER100 = -1;
const MAGICNUMBER1 = 1;
const SOURCE = 'ASSIGNMENT';
const renderTeacherRedirect = () => <Redirect to="/assignments/all" />;
// const renderAllAssignments = (testFunction: any) => <MyAssignments typeOfAssignmentsList="all" />;
function renderAllAssignments() {
  return <MyAssignments typeOfAssignmentsList="all" />;
}
// const renderMyAssignments = () => <MyAssignments typeOfAssignmentsList="my" />;
const renderMyAssignments = () => (
  < MyAssignments typeOfAssignmentsList="my" />
);
const renderMySchoolAssignments = () => (<MyAssignments typeOfAssignmentsList="myschool" />);
const renderInReviewAssignments = () => (<MyAssignments typeOfAssignmentsList="inreview" />);

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

const teacherRoutes = () => (
  <Switch>
    <Route
      path="/assignments"
      exact
      render={renderTeacherRedirect}
    />
    <Route
      path="/assignments/all"
      render={() => (renderAllAssignments())}
    />
    <Route
      path="/assignments/myschool"
      render={() => (renderMySchoolAssignments())}
    />
    <Route
      path="/assignments/my"
      render={() => (renderMyAssignments())}
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

const studentRoutes = () => (
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

const contentManagerRoutes = () => (
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
      path="/assignments/inreview"
      render={renderInReviewAssignments}
    />
    <Route
      path="/*"
      component={Page404}
    />
  </Switch>
);

const AssignmentsPageRouter = () => (
  <Switch>
    {currentUserRole === UserType.Teacher && teacherRoutes()}
    {currentUserRole === UserType.Student && studentRoutes()}
    {currentUserRole === UserType.ContentManager && contentManagerRoutes()}

    <Route path="/assignments/school" />
    <Route path="/assignments/favorites" />
  </Switch>
);

// const AssignmentsPageRouter = () => (
//   <Switch>

//     {currentUserRole === UserType.Teacher && teacherRoutes}
//     {currentUserRole === UserType.Student && studentRoutes}
//     {currentUserRole === UserType.ContentManager && contentManagerRoutes}

//     <Route path="/assignments/school" />
//     <Route path="/assignments/favorites" />
//   </Switch>
// );

interface State {
  myValueLocale: Array<number>;
  myValueGrade: Array<number>;
  myValueSubject: Array<number>;
  myValueMulti: Array<number>;
  myValueReading: Array<number>;
  myValueSource: Array<number>;
  myValueCore: Array<any>;
  myValueGoal: Array<any>;
  goalValueFilter: Array<any>;
  customCoreList: Array<GreepSelectValue>;
  grepFiltersData: FilterGrep;
  optionsCore: Array<GreepSelectValue>;
  optionsMulti: Array<Greep>;
  optionsReading: Array<Greep>;
  optionsSource: Array<Greep>;
  optionsSubjects: Array<GrepFilters>;
  optionsLocales: Array<Greep>;
  optionsGrades: Array<GrepFilters>;
  optionsGoals: Array<GreepSelectValue>;
  customGradeChildrenList: Array<Grade>;
  valueCoreOptions: Array<number>;
  valueMultiOptions: Array<number>;
  valuereadingOptions: number;
  valuersourceOptions: number;
  valueGradesOptions: Array<number>;
  valueSubjectsOptions: Array<number>;
  valueGoalsOptions: Array<number>;
  valueStringGoalsOptions: Array<string>;
  subjectsArrayFilter: Array<Subject>;
  gradesArrayFilter: Array<Grade>;
  filtersisUsed: boolean;
  filtersAjaxLoading: boolean;
  filtersAjaxLoadingGoals: boolean;
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
    {
      name: 'My school',
      url: '/assignments/myschool'
    }
    /*
      {
        name: 'My favorites',
        url: '/teacher/assignments/favorites'
    }*/
  ];
  public tabNavigationLinksCm = [
    {
      name: 'All assignments',
      url: '/assignments/all'
    },
    {
      name: 'My assignments',
      url: '/assignments/my'
    },
    {
      name: 'In review',
      url: '/assignments/inreview'
    }
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
      myValueLocale: [],
      myValueGrade: [],
      myValueSubject: [],
      myValueMulti: [],
      myValueReading: [],
      myValueCore: [],
      myValueSource: [],
      myValueGoal: [],
      goalValueFilter: [],
      customCoreList: [],
      grepFiltersData: {},
      optionsCore: [],
      optionsMulti: [],
      optionsReading: [],
      optionsSubjects: [],
      optionsLocales: [],
      optionsGrades: [],
      optionsGoals: [],
      optionsSource: [],
      customGradeChildrenList: [],
      valueCoreOptions: [],
      valueMultiOptions: [],
      valuereadingOptions: 0,
      valuersourceOptions: 0,
      valueGradesOptions: [],
      valueSubjectsOptions: [],
      valueGoalsOptions: [],
      valueStringGoalsOptions: [],
      subjectsArrayFilter: [],
      gradesArrayFilter: [],
      filtersisUsed: false,
      filtersAjaxLoading: false,
      filtersAjaxLoadingGoals: false
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
  private handleClickLocale = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const localeId = Number(e.currentTarget.value);
    const filterLocale: Array<number> = [];

    if (e.currentTarget.classList.contains('active')) {
      e.currentTarget.classList.remove('active');
    } else {
      filterLocale.push(localeId);
    }

    this.setState(
      {
        myValueLocale: filterLocale
      },
      () => {
        QueryStringHelper.set(this.props.history, QueryStringKeys.LOCALE, String(filterLocale));
        QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);

        this.assigValueData(String(this.state.myValueLocale), String(this.state.myValueGrade), String(this.state.myValueSubject), '', '');
      }
    );
  }
  private handleClickGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { optionsGrades, myValueGrade } = this.state;

    const currentTarget = e.currentTarget;
    const value = currentTarget.value;
    const arrayMyValue = value.split(',');

    let valueSelectedGrades: Array<number> = [];
    const NumberArrayMyValue = [];
    const valueToArray: Array<number> = [];
    const newArrayGradeChildren: Array<Grade> = [];

    let isInclude = myValueGrade!.includes(Number(value));

    if (arrayMyValue.length > 1) {
      arrayMyValue.forEach((ar) => {
        NumberArrayMyValue.push(Number(ar));
      });
      isInclude = String(myValueGrade) === value;
    } else {
      NumberArrayMyValue.push(Number(value));
    }
    if (!isInclude) {
      currentTarget.classList.add('active');
      valueSelectedGrades = NumberArrayMyValue;
      this.setState({ filtersisUsed: true });

    } else {
      currentTarget.classList.remove('active');
      valueSelectedGrades = [];
      if (this.state.myValueSubject.length > 0 || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti.length > 0 || this.state.myValueReading.length > 0 || valueSelectedGrades.length > 0) {
        this.setState({ filtersisUsed: true });
      } else {
        this.setState({ filtersisUsed: false });
      }
    }
    this.setState({
      myValueGrade: valueSelectedGrades
    });
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GRADE,
      String(valueSelectedGrades)
    );
    optionsGrades!.forEach((element) => {
      valueSelectedGrades.forEach((el) => {
        if (Number(element.wp_id) === Number(el)) {
          valueToArray.push(element.id);
          if (element.grade_parent !== null) {
            newArrayGradeChildren.push({
              id: element.wp_id,
              title: element.name,
              filterStatus: element.filterStatus,
              grade_parent: element.grade_parent,
              name_sub: element.name_sub
            });
          }
        }
      });
    });
    this.setState({ valueGradesOptions: valueToArray });
    this.setState({ customGradeChildrenList: newArrayGradeChildren });
    this.assigValueData(String(this.state.myValueLocale), String(valueSelectedGrades), String(this.state.myValueSubject), '', '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleClickChildrenGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { optionsGrades, valueSubjectsOptions, valueCoreOptions, myValueCore, valueMultiOptions, valueGradesOptions } = this.state;
    const currentTarget = e.currentTarget;
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GREPMAINTOPICSIDS,
      String([])
    );

    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GREPREADINGINSUBJECT,
      String([])
    );

    this.setState(
      {
        valueMultiOptions: [],
        myValueMulti: [],
        valuereadingOptions: 0,
        myValueReading: [],
        myValueSource: [],
      },
      async () => {
        // const valueSelectedGrades = this.state.myValueGrade;
        let valueSelectedGrades: Array<number> = [];
        const value = currentTarget.value;
        const arrayMyValue = value.split(',');
        const NumberArrayMyValue = [];
        const valueToArray: Array<number> = [];

        if (value === String(this.state.myValueGrade)) {
          currentTarget.classList.remove('active');
          valueSelectedGrades = [];
        } else {
          currentTarget.classList.add('active');
          arrayMyValue.forEach((ar) => {
            valueSelectedGrades.push(Number(ar));
          });
        }
        this.setState({
          myValueGrade: valueSelectedGrades
        });
        optionsGrades!.forEach((element) => {
          valueSelectedGrades.forEach((el) => {
            if (Number(element.wp_id) === Number(el)) {
              valueToArray.push(element.id);
            }
          });
        });
        this.setState({ valueGradesOptions: valueToArray });
        QueryStringHelper.set(
          this.props.history,
          QueryStringKeys.GRADE,
          String(valueSelectedGrades)
        );
        QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
        this.assigValueData(String(this.state.myValueLocale), String(valueSelectedGrades), String(this.state.myValueSubject), '', '');
      });

  }

  public handleClickSubject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { newAssignmentStore } = this.props;
    const { optionsSubjects, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const valueSelectedSubjects = this.state.myValueSubject;
    const value = e.currentTarget.value;
    const valueToArray: Array<number> = [];
    if (!valueSelectedSubjects!.includes(Number(value))) {
      valueSelectedSubjects!.push(Number(value));
      this.setState({ filtersisUsed: true });
    } else {
      const indexSelected = valueSelectedSubjects!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedSubjects!.splice(indexSelected, 1);
      }
      if (this.state.myValueSubject.length > 0 || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti.length > 0 || this.state.myValueReading.length > 0 || this.state.myValueGrade.length > 0) {
        this.setState({ filtersisUsed: true });
      } else {
        this.setState({ filtersisUsed: false });
      }
    }
    this.setState({
      myValueSubject: valueSelectedSubjects
    });
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.SUBJECT,
      String(valueSelectedSubjects)
    );
    optionsSubjects!.forEach((element) => {
      valueSelectedSubjects.forEach((el) => {
        if (Number(element.wp_id) === Number(el)) {
          valueToArray.push(element.id);
          this.setState({ valueSubjectsOptions: valueToArray });
        }
      });
    });
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    this.assigValueData(String(this.state.myValueLocale), String(this.state.myValueGrade), String(valueSelectedSubjects), '', '');
  }

  public handleClickMulti = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { newAssignmentStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const value = e.currentTarget.value;
    const valueSelectedMulti = this.state.myValueMulti;
    if (!valueSelectedMulti!.includes(Number(value))) {
      valueSelectedMulti!.push(Number(value));
      this.setState({ filtersisUsed: true });
    } else {
      const indexSelected = valueSelectedMulti!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedMulti!.splice(indexSelected, 1);
      }
      if (this.state.myValueSubject.length > 0 || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti.length > 0 || this.state.myValueReading.length > 0 || this.state.myValueGrade.length > 0) {
        this.setState({ filtersisUsed: true });
      } else {
        this.setState({ filtersisUsed: false });
      }
    }
    this.setState({ valueMultiOptions: valueSelectedMulti });
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GREPMAINTOPICSIDS,
      String(valueSelectedMulti)
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleClickReading = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const valueSelectedReading = this.state.myValueReading;
    this.setState({ valuereadingOptions: Number(value) });
    if (!valueSelectedReading!.includes(Number(value))) {
      valueSelectedReading!.push(Number(value));
      this.setState({ filtersisUsed: true });
    } else {
      const indexSelected = valueSelectedReading!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedReading!.splice(indexSelected, 1);
      }
      if (this.state.myValueSubject.length > 0 || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti.length > 0 || this.state.myValueReading.length > 0 || this.state.myValueGrade.length > 0) {
        this.setState({ filtersisUsed: true });
      } else {
        this.setState({ filtersisUsed: false });
      }
    }
    this.setState({
      myValueReading: valueSelectedReading
    });
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GREPREADINGINSUBJECT,
      String(valueSelectedReading)
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleClickSource = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const valueSelectedSource = this.state.myValueSource;
    this.setState({ valuersourceOptions: Number(value) });
    if (!valueSelectedSource!.includes(Number(value))) {
      valueSelectedSource!.push(Number(value));
      this.setState({ filtersisUsed: true });
    } else {
      const indexSelected = valueSelectedSource!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedSource!.splice(indexSelected, 1);
      }
      if (this.state.myValueSubject.length > 0 || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti.length > 0 || this.state.myValueReading.length > 0 || this.state.myValueGrade.length > 0) {
        this.setState({ filtersisUsed: true });
      } else {
        this.setState({ filtersisUsed: false });
      }
    }
    this.setState({
      myValueSource: valueSelectedSource
    });
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.SOURCE,
      String(valueSelectedSource)
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleChangeSelectCore = async (newValue: Array<any>) => {
    const ArrayValue: Array<number> = [];
    const { newAssignmentStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    this.setState(
      {
        myValueCore: newValue
      },
      () => {
        if (this.state.myValueSubject.length > 0 || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti.length > 0 || this.state.myValueReading.length > 0 || this.state.myValueGrade.length > 0) {
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
    this.assigValueData(String(this.state.myValueLocale), String(this.state.myValueGrade), String(this.state.myValueSubject), String(ArrayValue), String(this.state.myValueGoal));
    let singleString: string = '';
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

  public handleChangeSelectGoals = async (newValue: Array<any>) => {
    const ArrayValue: Array<number> = [];
    this.setState(
      {
        myValueGoal: newValue
      },
      () => {
        if (this.state.myValueSubject.length > 0 || this.state.myValueCore.length > 0 || this.state.myValueGoal.length > 0 || this.state.myValueMulti.length > 0 || this.state.myValueReading.length > 0 || this.state.myValueGrade.length > 0) {
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
    this.assigValueData(String(this.state.myValueLocale), String(this.state.myValueGrade), String(this.state.myValueSubject), String(this.state.myValueCore), String(ArrayValue));
    let singleString: string = '';
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

  public handleChangeIsAnswered = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value;

    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.IS_ANSWERED,
      value === BooleanFilter.FALSE || value === BooleanFilter.TRUE ? value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleChangeIsEvaluated = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value;

    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.IS_EVALUATED,
      value === BooleanFilter.FALSE || value === BooleanFilter.TRUE ? value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleChangeSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      QueryStringHelper.set(this.props.history, QueryStringKeys.SEARCH, e.currentTarget.value);
      QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    }
  }

  public onChangePage = ({ selected }: { selected: number }) => {
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, selected + 1);
  }

  public renderValueOptions = (data: FilterGrep, type: string) => {
    const returnArray: Array<GreepSelectValue> = [];
    if (type === 'core') {
      data!.coreElementsFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'goal') {
      data!.goalFilters!.forEach((element) => {
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
    const returnArray: Array<Greep> = [];
    if (type === 'source') {
      data!.sourceFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          id: Number(element.wp_id),
          title: element.name
        });
      });
    }
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
    if (type === 'locale') {
      data!.localeFilters!.forEach((element) => {
        returnArray.push({
          id: Number(element.id),
          title: element.name,
        });
      });
    }
    return returnArray;
  }

  public renderValueOptionsBasics = (data: FilterGrep, type: string) => {
    const returnArray: Array<GrepFilters> = [];
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
          wp_id: element.wp_id,
          filterStatus: element.filterStatus,
          // tslint:disable-next-line: variable-name
          grade_parent: element.grade_parent,
          // tslint:disable-next-line: variable-name
          name_sub: element.name_sub
        });
      });
    }
    return returnArray;
  }

  public renderValueOptionsGoals = (data: Array<GoalsData>) => {
    const returnArray: Array<GreepSelectValue> = [];
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
    filter.locale = QueryStringHelper.getString(this.props.history, QueryStringKeys.LOCALE);
    filter.grade = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE);
    filter.subject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT);
    filter.grepCoreElementsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS);
    filter.grepMainTopicsIds = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS);
    filter.grepGoalsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREEPGOALSIDS);
    filter.grepReadingInSubject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT);
    filter.source = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SOURCE);
    filter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH);
    filter.order = QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER, SortingFilter.DESC);
    filter.orderField = SortingFilter.CREATION_DATE;

    if (filter.locale || filter.subject || filter.grade || filter.grepCoreElementsIds || filter.grepMainTopicsIds || filter.grepGoalsIds || filter.grepReadingInSubject) {
      this.setState({ filtersisUsed: true });
    } else {
      this.setState({ filtersisUsed: false });
    }
  }

  public async assigValueData(locale: string, grades: string, subjects: string, core?: string, goals?: string, typeList?: string) {

    const { newAssignmentStore } = this.props;

    this.setState({ filtersAjaxLoading: true });
    this.setState({ filtersAjaxLoadingGoals: true });
    let grepFiltersDataAwait = null;
    switch (typeList) {
      case 'all':
        grepFiltersDataAwait = await newAssignmentStore!.getGrepFiltersAssignment(locale, grades, subjects, core, goals);
        break;
      case 'my':
        grepFiltersDataAwait = await newAssignmentStore!.getGrepFiltersMyAssignment(locale, grades, subjects, core, goals);
        break;
      case 'myschool':
        grepFiltersDataAwait = await newAssignmentStore!.getGrepFiltersMySchoolAssignment(locale, grades, subjects, core, goals);
        break;
      default:
        grepFiltersDataAwait = await newAssignmentStore!.getGrepFiltersAssignment(locale, grades, subjects, core, goals);
        break;
    }

    this.setState({
      grepFiltersData: grepFiltersDataAwait
    });
    this.setState({
      optionsCore: this.renderValueOptions(grepFiltersDataAwait, 'core')
    });
    this.setState({
      optionsMulti: this.renderValueOptionsNumbers(grepFiltersDataAwait, 'multi')
    });
    this.setState({
      optionsReading: this.renderValueOptionsNumbers(grepFiltersDataAwait, 'reading')
    });
    this.setState({
      optionsSource: this.renderValueOptionsNumbers(grepFiltersDataAwait, 'source')
    });
    this.setState({
      optionsGoals: this.renderValueOptions(grepFiltersDataAwait, 'goal').sort((a, b) => (a.label > b.label) ? 1 : -1)
    });
    this.setState(
      {
        optionsSubjects: this.renderValueOptionsBasics(grepFiltersDataAwait, 'subject')
      },
      () => {
        this.setState(
          {
            subjectsArrayFilter: this.renderDataSubjects(this.state.optionsSubjects)
          },
          () => {
            const ArrayValue: Array<number> = [];
            this.state.subjectsArrayFilter!.forEach((element) => {
              this.state.myValueSubject.forEach((el) => {
                if (Number(element.id) === Number(el)) {
                  ArrayValue.push(element.id);
                }
              });
            });
            this.setState({ myValueSubject: ArrayValue });
            if (grades !== '' && subjects !== '') {
              QueryStringHelper.set(
                this.props.history,
                QueryStringKeys.SUBJECT,
                String(ArrayValue)
              );
            }
          }
        );
      }
    );
    this.setState(
      {
        optionsGrades: this.renderValueOptionsBasics(grepFiltersDataAwait, 'grade')
      },
      () => {
        this.setState(
          {
            gradesArrayFilter: this.renderDataGrades(this.state.optionsGrades)
          },
          () => {
            const ArrayValue: Array<number> = [];
            const newArrayGradeChildren: Array<Grade> = [];
            this.state.gradesArrayFilter!.forEach((element) => {
              if (element.grade_parent !== null) {
                newArrayGradeChildren.push(element);
              }
              this.state.myValueGrade.forEach((el) => {
                if (Number(element.id) === Number(el)) {
                  ArrayValue.push(element.id);
                }
              });
            });
            this.setState({
              myValueGrade: ArrayValue
            });
            if (grades !== '' && subjects !== '') {
              QueryStringHelper.set(
                this.props.history,
                QueryStringKeys.GRADE,
                String(ArrayValue)
              );
            }
          }
        );
      }
    );
    this.setState({ optionsLocales: this.renderValueOptionsNumbers(grepFiltersDataAwait, 'locale') });

    this.setState({ filtersAjaxLoading: false });
    this.setState({ filtersAjaxLoadingGoals: false });
  }

  public changeDataSource = (data: Array<Source>) => {
    const returnArray: Array<Greep> = [];
    data!.forEach((element) => {
      returnArray.push({
        id: Number(element.id),
        title: element.title
      });
    });
    return returnArray;
  }

  public renderDataGrades = (data: Array<GrepFilters>) => {
    const returnArray: Array<any> = [];
    data!.forEach((element) => {
      returnArray.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.wp_id),
        title: element.name,
        filterStatus: element.filterStatus,
        // tslint:disable-next-line: variable-name
        grade_parent: element.grade_parent,
        // tslint:disable-next-line: variable-name
        name_sub: element.name_sub
      });
    });
    return returnArray;
  }

  public renderDataSubjects = (data: Array<GrepFilters>) => {
    const returnArray: Array<Subject> = [];
    data!.forEach((element) => {
      returnArray.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.wp_id),
        title: element.name,
        filterStatus: null
      });
    });
    return returnArray;
  }

  public async componentDidMount() {
    const { newAssignmentStore, assignmentListStore } = this.props;
    const { valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions } = this.state;
    this.fetchTeachingPaths();
    if (!this.props.isStudent) {
      this.setState({ filtersAjaxLoading: true });
      this.assigValueData('', '', '', '', '');
      this.setState({ filtersAjaxLoading: false });
      const listGoals = [''];
      this.setState({
        valueStringGoalsOptions: listGoals
      });
    }
    document.addEventListener('keyup', this.handleKeyboardControl);
  }

  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const filterButton = Array.from(document.getElementsByClassName('closehandler') as HTMLCollectionOf<HTMLElement>);
    if ((event.shiftKey && event.key === 'H') || (event.shiftKey && event.key === 'h')) {
      filterButton[0]!.focus();
    }
  }

  public handleClickReset = async () => {
    QueryStringHelper.set(this.props.history, QueryStringKeys.LOCALE, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.GRADE, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.SUBJECT, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.GREEPGOALSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.SOURCE, '');
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);

    this.setState({ valueGradesOptions: [] });
    this.setState({ valueSubjectsOptions: [] });
    this.setState({ valueCoreOptions: [] });
    this.setState({ valueMultiOptions: [] });
    this.setState({ valuereadingOptions: 0 });
    this.setState({ filtersisUsed: false });
    this.setState({ myValueLocale: [] });
    this.setState({ myValueGrade: [] });
    this.setState({ myValueSubject: [] });
    this.setState({ myValueCore: [] });
    this.setState({ myValueMulti: [] });
    this.setState({ myValueReading: [] });
    this.setState({ myValueSource: [] });
    this.setState({ goalValueFilter: [] });
    this.setState({ optionsGoals: [] });
    this.setState({ subjectsArrayFilter: [] });
    this.setState({ gradesArrayFilter: [] });
    this.setState({ customGradeChildrenList: [] });

    const LocaleilterSubjectArray = Array.from(document.getElementsByClassName('localeFilterClass') as HTMLCollectionOf<HTMLElement>);
    LocaleilterSubjectArray.forEach((e) => {
      e.classList.remove('active');
    });
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
    this.assigValueData('', '', '', '', '');
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
          tabNavigationLinks={(currentUserRole === UserType.ContentManager) ? this.tabNavigationLinksCm : this.tabNavigationLinks}
          sourceTranslation={'assignments_tabs'}
          statusButtons={this.props.assignmentListStore!.assignmentsState}
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
          customLocalesList={this.state.optionsLocales}
          customGradesList={this.state.gradesArrayFilter}
          customSubjectsList={this.state.subjectsArrayFilter}
          customCoreTPList={this.state.optionsCore}
          customMultiList={this.state.optionsMulti}
          customReadingList={this.state.optionsReading}
          customSourceList={this.state.optionsSource}
          customGoalsTPList={this.state.optionsGoals}
          customGradeChildrenList={this.state.customGradeChildrenList}
          filtersisUsed={this.state.filtersisUsed}
          filtersAjaxLoading={this.state.filtersAjaxLoading}
          filtersAjaxLoadingGoals={this.state.filtersAjaxLoadingGoals}
          // METHODS
          handleChangeSubject={this.handleChangeSubject}
          handleChangeGrade={this.handleChangeGrade}
          handleClickChildrenGrade={this.handleClickChildrenGrade}
          handleInputSearchQuery={this.handleChangeSearchQuery}
          handleChangeSorting={this.handleChangeSorting}
          handleChangeAnswerStatus={this.handleChangeIsAnswered}
          handleChangeEvaluationStatus={this.handleChangeIsEvaluated}
          handleClickLocale={this.handleClickLocale}
          handleClickGrade={this.handleClickGrade}
          handleClickSubject={this.handleClickSubject}
          handleClickMulti={this.handleClickMulti}
          handleClickReading={this.handleClickReading}
          handleChangeSelectCore={this.handleChangeSelectCore}
          handleChangeSelectGoals={this.handleChangeSelectGoals}
          handleClickReset={this.handleClickReset}
          handleClickSource={this.handleClickSource}
          // VALUES
          defaultValueLocaleFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.LOCALE)}
          defaultValueGradeFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.GRADE)}
          activityFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.ACTIVITY)}
          defaultValueSubjectFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.SUBJECT)}
          isAnsweredFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_ANSWERED)}
          isEvaluatedFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_EVALUATED)}
          orderFieldFilterValue={isStudent ? SortingFilter.DEADLINE : SortingFilter.CREATION_DATE}
          orderFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER)}
          searchQueryFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH)}
          coreFilterValueTP={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS)}
          goalsFilterValueTP={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREEPGOALSIDS)}
          coreValueFilter={this.state.myValueCore}
          goalValueFilter={this.state.goalValueFilter}

          defaultValueMainFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS)}
          defaultValueReadingFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT)}
          defaultValueSourceFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.SOURCE)}
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

  public renderTitle = () => {
    const { location } = this.props;
    return (
      <h1 className="generalTitle">
        {intl.get('assignments search.title')}
      </h1>
    );
  }

  public render() {
    const isAnswerPage = this.props.location.pathname.includes('/answers');
    const classes = classNames('AssignmentsPage moveListBySearchFilter ', {
      AssignmentsPage_noTabs: !this.hasTabNavigation()
    });

    // const testFunction = (string: any) => (console.log(string));
    // const testFunction = (cadena: any) => (this.assigValueData('', '', '', '', '', cadena));

    return (
      <div className={classes}>
        {!isAnswerPage && this.renderTitle()}
        {this.renderTabNavigations()}

        {this.renderSearchFilter()}
        {AssignmentsPageRouter()}

        {this.renderPagination()}
      </div>
    );
  }
}

export const AssignmentsPage = withRouter(AssignmentsPageWrapper);
