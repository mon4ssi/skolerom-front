import React, { Component, SyntheticEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import debounce from 'lodash/debounce';

import { TeachingPathsListStore } from './TeachingPathsListStore';
import { GrepElementFilters, FilterGrep, GreepSelectValue, GrepFilters, GoalsData, Greep, GreepElements, Subject, Source, Grade } from 'assignment/Assignment';
import { InfoCard } from 'components/common/InfoCard/InfoCard';
import { TabNavigation } from 'components/common/TabNavigation/TabNavigation';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { Pagination } from 'components/common/Pagination/Pagination';
import { EditTeachingPathStore } from '../EditTeachingPath/EditTeachingPathStore';
import { UserType } from 'user/User';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { SideOutPanel } from 'components/common/SideOutPanel/SideOutPanel';

import { DEBOUNCE_TIME } from 'utils/constants';
import { lettersNoEn } from 'utils/lettersNoEn';
import { SortingFilter, StoreState, QueryStringKeys } from 'utils/enums';
import * as QueryStringHelper from 'utils/QueryStringHelper';

import teachingPath from 'assets/images/teaching-path.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';

import './TeachingPathsList.scss';
import { SideOutPanelPreview } from 'components/common/SideOutPanelPreview/SideOutPanelPreview';
import { SideOutPanelPreviewTeachingPath } from 'components/common/SideOutPanelPreviewTeachingPath/SideOutPanelPreviewTeachingPath';
import { TeachingPathService, TEACHING_PATH_SERVICE } from 'teachingPath/service';
import { injector } from 'Injector';
import { TeachingPath } from 'teachingPath/TeachingPath';

const MAGICNUMBER100 = -1;
const MAGICNUMBER1 = 1;
const limitSplicePathname = 4;
const limitSplicePathname5 = 5;
const limitIndex = 2;
const heightMin = 250;
const SOURCE = 'TEACHING_PATH';

interface Props extends RouteComponentProps {
  readOnly?: boolean;
  typeOfTeachingPathsList?: string;
  teachingPathsListStore?: TeachingPathsListStore;
  editTeachingPathStore?: EditTeachingPathStore;
  isContentManager?: boolean;
  isNotStudent?: boolean;
}

interface State {
  idActiveCard: number | null;
  isTeachingPathPreviewVisible: boolean;
  isTeachingPathPreviewTeacherCMVisible: boolean;
  isPublishedCurrentTeachingPath: boolean;
  selectedCoresAll: Array<GrepElementFilters>;
  selectedCoresFilter: Array<GrepElementFilters>;
  grepFiltersData: FilterGrep;
  optionsCore: Array<GreepSelectValue>;
  optionsMulti: Array<Greep>;
  optionsReading: Array<Greep>;
  optionsSource: Array<Greep>;
  optionsSubjects: Array<GrepFilters>;
  optionsGrades: Array<GrepFilters>;
  optionsLocales: Array<Greep>;
  optionsGoals: Array<GreepSelectValue>;
  customGradeChildrenList: Array<Grade>;
  valueCoreOptions: Array<number>;
  valueMultiOptions: Array<number>;
  valuereadingOptions: number;
  valuesourceOptions: number;
  valueGradesOptions: Array<number>;
  valueSubjectsOptions: Array<number>;
  valueGoalsOptions: Array<number>;
  valueStringGoalsOptions: Array<string>;
  myValueLocale: Array<number>;
  myValueGrade: Array<number>;
  myValueSubject: Array<number>;
  myValueMulti: Array<number>;
  myValueReading: Array<number>;
  myValueSource: Array<number>;
  myValueCore: Array<any>;
  goalValueFilter: Array<any>;
  subjectsArrayFilter: Array<Subject>;
  gradesArrayFilter: Array<Grade>;
  filtersisUsed: boolean;
  filtersAjaxLoading: boolean;
  filtersAjaxLoadingGoals: boolean;
  showMySchool: number;
  currentTeachingPathView: string;
}

@inject('teachingPathsListStore', 'editTeachingPathStore')
@observer
class TeachingPathsListComponent extends Component<Props, State> {
  private teachingPathService: TeachingPathService = injector.get(TEACHING_PATH_SERVICE);

  private tabNavigationLinks = [
    {
      name: 'All teaching paths',
      url: '/teaching-paths/all'
    },
    {
      name: 'My teaching paths',
      url: '/teaching-paths/my'
    },
    {
      name: 'My school',
      url: '/teaching-paths/myschool'
    }
    // {
    //   name: 'My favorites',
    //   url: '/teacher/teaching-paths/favorites'
    // }
  ];
  private tabNavigationLinksCM = [
    {
      name: 'All teaching paths',
      url: '/teaching-paths/all'
    },
    {
      name: 'My teaching paths',
      url: '/teaching-paths/my'
    }
    // {
    //   name: 'My favorites',
    //   url: '/teacher/teaching-paths/favorites'
    // }
  ];
  private locationUpdateListener: () => void = debounce(
    () => {
      const { history } = this.props;
      if (
        history.location.pathname.includes('/teaching-paths') &&
        !history.location.pathname.includes('/edit') &&
        !history.location.pathname.includes('/view')
      ) {
        this.fetchTeachingPaths();
      }
    },
    DEBOUNCE_TIME,
  );
  constructor(props: Props) {
    super(props);
    this.state = {
      idActiveCard: null,
      isTeachingPathPreviewVisible: false,
      isTeachingPathPreviewTeacherCMVisible: false,
      isPublishedCurrentTeachingPath: false,
      selectedCoresAll: [],
      selectedCoresFilter: [],
      grepFiltersData: {},
      optionsCore: [],
      optionsMulti: [],
      optionsReading: [],
      optionsSource: [],
      optionsSubjects: [],
      optionsGrades: [],
      optionsLocales: [],
      optionsGoals: [],
      customGradeChildrenList: [],
      valueCoreOptions: [],
      valueMultiOptions: [],
      valuereadingOptions: 0,
      valuesourceOptions: 0,
      valueGradesOptions: [],
      valueSubjectsOptions: [],
      valueGoalsOptions: [],
      valueStringGoalsOptions: [],
      myValueLocale: [],
      myValueGrade: [],
      myValueSubject: [],
      myValueMulti: [],
      myValueReading: [],
      myValueSource: [],
      myValueCore: [],
      subjectsArrayFilter: [],
      gradesArrayFilter: [],
      goalValueFilter: [],
      filtersisUsed: false,
      filtersAjaxLoading: false,
      filtersAjaxLoadingGoals: false,
      showMySchool: 0,
      currentTeachingPathView: '',
    };
  }

  public unregisterListener: () => void = () => undefined;

  public fetchTeachingPaths() {
    const { filter } = this.props.teachingPathsListStore!;

    filter.page = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE, 1);
    filter.locale = QueryStringHelper.getString(this.props.history, QueryStringKeys.LOCALE);
    filter.grade = QueryStringHelper.getString(this.props.history, QueryStringKeys.GRADE);
    filter.subject = QueryStringHelper.getString(this.props.history, QueryStringKeys.SUBJECT);
    filter.grepCoreElementsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS);
    filter.grepMainTopicsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS);
    filter.grepGoalsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREEPGOALSIDS);
    filter.grepReadingInSubject = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT);
    filter.source = QueryStringHelper.getString(this.props.history, QueryStringKeys.SOURCE);
    filter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH);
    filter.order = QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER, SortingFilter.DESC);
    filter.articles = QueryStringHelper.getString(this.props.history, QueryStringKeys.ARTICLES);
    if (this.state.showMySchool !== 0) {
      filter.showMySchoolTeachingpath = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.MYSCHOOL, this.state.showMySchool);
    }

    filter.orderField = SortingFilter.CREATION_DATE;

    if (filter.locale || filter.subject || filter.grade || filter.grepCoreElementsIds || filter.grepMainTopicsIds || filter.grepGoalsIds || filter.grepReadingInSubject || filter.source) {
      this.setState({ filtersisUsed: true });
    } else {
      this.setState({ filtersisUsed: false });
    }

    this.props.teachingPathsListStore!.getTeachingPathsList();
  }

  public async assigValueData(locale: string, grades: string, subjects: string, core?: string, multi?: string, goals?: string, source?: string, refreshSubject?: boolean, refreshGrade?: boolean) {
    const { editTeachingPathStore } = this.props;

    this.setState({ filtersAjaxLoading: true });
    this.setState({ filtersAjaxLoadingGoals: true });

    const grepFiltersDataAwait = await editTeachingPathStore!.getGrepFiltersTeachingPath(locale, grades, subjects, core, multi, goals, source);

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
      optionsGoals: this.renderValueOptions(grepFiltersDataAwait, 'goals').sort((a, b) => (a.label > b.label) ? 1 : -1)
    });
    if (refreshSubject) {
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
    }
    if (refreshGrade) {
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
    }
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

  public renderDataSubjects = (data: Array<GrepFilters>) => {
    const returnArray: Array<any> = [];
    data!.forEach((element) => {

      returnArray.push({
        // tslint:disable-next-line: variable-name
        id: Number(element.wp_id),
        title: element.name,
        filterStatus: element.filterStatus
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

  public async componentDidMount() {
    localStorage.removeItem('url');
    /* console.log(localStorage.getItem('url')); */
    const { editTeachingPathStore, typeOfTeachingPathsList } = this.props;
    const { valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions } = this.state;
    this.setCurrentTab();
    this.fetchTeachingPaths();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
    if (typeOfTeachingPathsList === 'myschool') {
      this.setState({
        showMySchool : 1
      });
    }
    document.addEventListener('keyup', this.handleKeyboardControl);
    if (this.props.isNotStudent) {
      this.assigValueData('', '', '', '', '', '', '', true, true);
      const listGoals = [''];
      this.setState({
        valueStringGoalsOptions: listGoals
      });
    }
  }

  public transformDataToString = (data: Array<GreepElements>) => {
    const returnArray: Array<string> = [];
    data!.forEach((element) => {
      returnArray.push(element.kode);
    });
    return returnArray;
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
    if (type === 'multi') {
      data!.mainTopicFilters!.forEach((element) => {
        returnArray.push({
          // tslint:disable-next-line: variable-name
          value: Number(element.id),
          label: element.description
        });
      });
    }
    if (type === 'goals') {
      data!.goalFilters!.forEach((element) => {
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
          wp_id: element.wp_id,
          filterStatus: element.filterStatus,
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

  public componentDidUpdate = async (prevProps: Props) => {
    const { typeOfTeachingPathsList } = this.props;
    if (prevProps.typeOfTeachingPathsList !== typeOfTeachingPathsList) {
      this.setCurrentTab();
    }
  }

  public componentWillUnmount() {
    this.unregisterListener();
    this.props.teachingPathsListStore!.resetTeachingPathsList();
  }

  public setCurrentTab = async () => {
    const { teachingPathsListStore, location } = this.props;

    const type = location.pathname.split('/', limitSplicePathname)[limitIndex];
    teachingPathsListStore!.setTypeOfTeachingPathsList(type);
  }

  public manageTeachingPathAction = async (id: number, userType?: UserType) => {
    const { teachingPathsListStore, history } = this.props;

    this.unregisterListener();
    this.props.teachingPathsListStore!.setCurrentTeachingPath(id);
    const { currentEntity } = teachingPathsListStore!;
    switch (userType) {
      case UserType.ContentManager:
      case UserType.Teacher:
        if (!currentEntity!.isPublished) {
          history.push(`/teaching-paths/edit/${id}`);
        } else {
          this.setState({ isPublishedCurrentTeachingPath: true });
          const response: TeachingPath = await this.teachingPathService.getTeachingPathDataById(currentEntity!.id);
          this.props.teachingPathsListStore!.setCurrentTeachingPathEntity(response);
          this.setState({ isTeachingPathPreviewTeacherCMVisible: true });
        }
        break;
      case UserType.Student:
        this.unregisterListener();
        this.props.teachingPathsListStore!.setCurrentTeachingPath(id);
        this.setState({ isTeachingPathPreviewVisible: true });
      default:
        break;
    }

  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.setState({ isTeachingPathPreviewVisible: false });
    }
  }

  public onClickTeachingPath = (id: number, view?: string) => {
    const { teachingPathsListStore, history } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;
    switch (currentUserType) {
      case UserType.Teacher:
      case UserType.ContentManager:
        /*   if (view === 'show') {
            history.push(`/teaching-paths/view/${id}`);
            break;
          }
          history.push(`/teaching-paths/edit/${id}`);
        */
        this.setState({ currentTeachingPathView: view! });
        this.manageTeachingPathAction(id, currentUserType);
        break;
      case UserType.Student:
        this.manageTeachingPathAction(id, currentUserType);
        break;
      default:
        break;
    }
  }

  public createTeachingPath = async () => {
    const { editTeachingPathStore, history } = this.props;
    const id = await editTeachingPathStore!
      .createTeachingPath()
      .then(response => response.id);
    history.push(`/teaching-paths/edit/${id}`);
  }

  public handleClickLocale = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

        this.assigValueData(String(this.state.myValueLocale), '', '', '', '', '', '', true, true);
      }
    );
  }
  public handleChangeSubject = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.SUBJECT,
      Number(e.currentTarget.value) ? e.currentTarget.value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    this.setState({ valueSubjectsOptions: [] });
  }

  public handleChangeGrade = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GRADE,
      Number(e.currentTarget.value) ? e.currentTarget.value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleChangeSorting = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [orderField, order] = e.currentTarget.value.split(' ');
    QueryStringHelper.set(this.props.history, QueryStringKeys.ORDER_FIELD, orderField);
    QueryStringHelper.set(this.props.history, QueryStringKeys.ORDER, order);
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleClickGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { editTeachingPathStore } = this.props;
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
        const newArrayGradeChildren: Array<Grade> = [];
        let isInclude = this.state.myValueGrade!.includes(Number(value));
        if (arrayMyValue.length > 1) {
          arrayMyValue.forEach((ar) => {
            isInclude = this.state.myValueGrade!.includes(Number(ar));
            NumberArrayMyValue.push(Number(ar));
          });
        } else {
          NumberArrayMyValue.push(Number(value));
        }
        if (!isInclude) {
          currentTarget.classList.add('active');
          valueSelectedGrades = NumberArrayMyValue;
        } else {
          currentTarget.classList.remove('active');
          valueSelectedGrades = [];
        }
        this.setState({
          myValueGrade: valueSelectedGrades
        });
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
        QueryStringHelper.set(
          this.props.history,
          QueryStringKeys.GRADE,
          String(valueSelectedGrades)
        );
        QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
        this.assigValueData(String(this.state.myValueLocale), String(valueSelectedGrades), String(this.state.myValueSubject), '', '', '', '', true, false);
      });
  }

  public handleClickChildrenGrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { editTeachingPathStore } = this.props;
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
        this.assigValueData(String(this.state.myValueLocale), String(valueSelectedGrades), String(this.state.myValueSubject), '', '', '', '', true, false);
      });

  }

  public handleClickSubject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const { editTeachingPathStore } = this.props;
    const { optionsSubjects, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const valueSelectedSubjects = this.state.myValueSubject;
    const value = e.currentTarget.value;
    const valueToArray: Array<number> = [];
    if (!valueSelectedSubjects!.includes(Number(value))) {
      e.currentTarget.classList.add('active');
      valueSelectedSubjects!.push(Number(value));
    } else {
      e.currentTarget.classList.remove('active');
      const indexSelected = valueSelectedSubjects!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedSubjects!.splice(indexSelected, 1);
      }
    }
    this.setState({
      myValueSubject: valueSelectedSubjects
    });
    optionsSubjects!.forEach((element) => {
      valueSelectedSubjects.forEach((el) => {
        if (Number(element.wp_id) === Number(el)) {
          valueToArray.push(element.id);
          this.setState({ valueSubjectsOptions: valueToArray });
        }
      });
    });
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.SUBJECT,
      String(valueSelectedSubjects)
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    this.assigValueData(String(this.state.myValueLocale), String(this.state.myValueGrade), String(valueSelectedSubjects), '', '', '', '', false, false);
  }

  public handleClickMulti = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.value;
    const { editTeachingPathStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const valueSelectedMulti = this.state.myValueMulti;
    if (!valueSelectedMulti!.includes(Number(value))) {
      e.currentTarget.classList.add('active');
      valueSelectedMulti!.push(Number(value));
    } else {
      e.currentTarget.classList.remove('active');
      const indexSelected = valueSelectedMulti!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedMulti!.splice(indexSelected, 1);
      }
    }
    this.setState({
      myValueMulti: valueSelectedMulti
    });
    const refreshSubject = (this.state.myValueSubject.length > 0) ? false : true;
    const refreshGrade = (this.state.myValueGrade.length > 0) ? false : true;
    this.assigValueData(String(this.state.myValueLocale), String(this.state.myValueGrade), String(this.state.myValueSubject), '', String(valueSelectedMulti), '', '', refreshSubject, refreshGrade);
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
      e.currentTarget.classList.add('active');
      valueSelectedReading!.push(Number(value));
    } else {
      e.currentTarget.classList.add('active');
      const indexSelected = valueSelectedReading!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedReading!.splice(indexSelected, 1);
      }
    }
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
    this.setState({ valuesourceOptions: Number(value) });
    if (!valueSelectedSource!.includes(Number(value))) {
      e.currentTarget.classList.add('active');
      valueSelectedSource!.push(Number(value));
    } else {
      e.currentTarget.classList.add('active');
      const indexSelected = valueSelectedSource!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedSource!.splice(indexSelected, 1);
      }
    }
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.SOURCE,
      String(valueSelectedSource)
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public async refreshSubject(coreElementsArray: Array<any>, goalsArray: Array<any>) {
    const { editTeachingPathStore } = this.props;

    const grepFiltersDataAwait = await editTeachingPathStore!.getGrepFiltersTeachingPath(String(this.state.myValueLocale), String(this.state.myValueGrade), String(this.state.myValueSubject), String(coreElementsArray), '', String(goalsArray), '');
    this.setState(
      {
        subjectsArrayFilter: this.renderDataSubjects(this.renderValueOptionsBasics(grepFiltersDataAwait, 'subject'))
      },

    );

  }

  public async refreshGrade(coreElementsArray: Array<any>, goalsArray: Array<any>) {
    const { editTeachingPathStore } = this.props;

    const grepFiltersDataAwait = await editTeachingPathStore!.getGrepFiltersTeachingPath(
      String(this.state.myValueLocale),
      String(this.state.myValueGrade),
      String(this.state.myValueSubject),
      String(coreElementsArray),
      '',
      String(goalsArray),
      '');

    this.setState(
      {
        gradesArrayFilter: this.renderDataGrades(this.renderValueOptionsBasics(grepFiltersDataAwait, 'grade'))
      },
    );
  }

  public handleChangeSelectCore = async (newValue: Array<any>) => {
    const ArrayValue: Array<number> = [];
    const { editTeachingPathStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions, valueGoalsOptions } = this.state;
    this.setState({ myValueCore: newValue });
    newValue.forEach((e) => {
      ArrayValue.push(e.value);
    });
    this.setState({ valueCoreOptions: ArrayValue });

    const refreshSubject = (this.state.myValueSubject.length > 0) ? false : true;
    const refreshGrade = (this.state.myValueGrade.length > 0) ? false : true;
    this.assigValueData(String(this.state.myValueLocale), String(this.state.myValueGrade), String(this.state.myValueSubject),
      String(ArrayValue), String(this.state.valueMultiOptions), String(this.state.valueGoalsOptions), '', refreshSubject, refreshGrade);
    // END REFRESH GOALS

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
    const { editTeachingPathStore } = this.props;

    const { valueCoreOptions, valueGoalsOptions } = this.state;
    const ArrayValue: Array<number> = [];
    newValue.forEach((e) => {
      ArrayValue.push(e.value);
    });
    this.setState({ valueGoalsOptions: ArrayValue });
    this.setState({ goalValueFilter: newValue });
    let singleString: string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
      });
    }

    const refreshSubject = (this.state.myValueSubject.length > 0) ? false : true;
    const refreshGrade = (this.state.myValueGrade.length > 0) ? false : true;
    this.assigValueData(String(this.state.myValueLocale), String(this.state.myValueGrade), String(this.state.myValueSubject),
      String(this.state.valueCoreOptions), String(this.state.valueMultiOptions), String(ArrayValue), '', refreshSubject, refreshGrade);
    // END REFRESH SUBJECTS

    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GREEPGOALSIDS,
      singleString
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public customCoreList = () => {
    const { selectedCoresAll, selectedCoresFilter } = this.state;
    if (selectedCoresFilter.length) {
      return selectedCoresFilter;
    }
    return selectedCoresAll;
  }

  public handleInputSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      QueryStringHelper.set(this.props.history, QueryStringKeys.SEARCH, e.currentTarget.value);
      QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    }
  }

  public renderTabNavigate = () => {
    const { readOnly, teachingPathsListStore } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    if (!readOnly) {
      return (
        <TabNavigation
          textMainButton={intl.get('teaching_path_tabs.new teaching path')}
          onClickMainButton={this.createTeachingPath}
          tabNavigationLinks={(currentUserType === UserType.ContentManager) ? this.tabNavigationLinksCM : this.tabNavigationLinks}
          sourceTranslation={'teaching_path_tabs'}
          statusButtons={this.props.teachingPathsListStore!.teachingPathsState}
        />
      );
    }
    return null;
  }

  public onChangePage = ({ selected }: { selected: number }) => {
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, selected + 1);
  }

  public setActiveTooltip = (id: number) => () => {
    if (id === this.state.idActiveCard) {
      return this.setState({ idActiveCard: null });
    }
    return this.setState({ idActiveCard: id });
  }

  public deleteTeachingPath = (id: number) => async () => {
    const { teachingPathsListStore, editTeachingPathStore } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      this.setState({ idActiveCard: null });
      await editTeachingPathStore!.deleteTeachingPathById(id);
      if (teachingPathsListStore!.teachingPathsList.length) {
        await teachingPathsListStore!.getTeachingPathsList();
      } else {
        teachingPathsListStore!.setFiltersPage(
          teachingPathsListStore!.currentPage! - 1
        );
      }
    }
  }

  public copyTeachingPath = async (id: number) => {
    const { teachingPathsListStore, history } = this.props;
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    if (currentUserType === UserType.Teacher || currentUserType === UserType.ContentManager) {
      const copyId = await teachingPathsListStore!.copyEntity(id);
      history.push(`/teaching-paths/edit/${copyId}`);
    }
  }

  public renderTeachingPathCards = () => {
    const { teachingPathsListStore } = this.props;
    const { idActiveCard } = this.state;
    const heightSkeletom = Number(heightMin);
    const currentUserType = teachingPathsListStore!.getCurrentUser()!.type;

    const teachingPaths = teachingPathsListStore!.teachingPathsState === StoreState.LOADING ?
      teachingPathsListStore!.teachingPathsForSkeleton :
      teachingPathsListStore!.teachingPathsList;
    if (teachingPaths.length === 0) {
      return (
        <div className="noResults emptyTeachingPaths">
          {intl.get('edit_teaching_path.No results found')}
        </div>
      );
    }
    return teachingPaths.map((item, index) => (
      teachingPathsListStore!.teachingPathsState === StoreState.LOADING ? (
        <SkeletonLoader height={heightSkeletom} key={index} className="SkeletonCard" />
      ) : (
        <InfoCard
          isTeachingPath
          isContentManager={currentUserType === UserType.ContentManager}
          withTooltip={currentUserType !== UserType.Student}
          key={item.id}
          id={item.id}
          title={item.title}
          grades={item.grades}
          description={item.description}
          icon={teachingPath}
          onClick={this.onClickTeachingPath}
          img={item.featuredImage ? item.featuredImage : listPlaceholderImg}
          view={item.view}
          levels={item.levels}
          setActiveTooltip={this.setActiveTooltip(item.id)}
          deleteTeachingPath={this.deleteTeachingPath(item.id)}
          idActiveCard={idActiveCard}
          copyTeachingPath={this.copyTeachingPath}
          isPublished={item.isPublished}
          isDistributed={item.isDistributed}
        />
      )
    )
    );
  }

  public renderPagination = () => {
    const { teachingPathsListStore } = this.props;
    const pages = teachingPathsListStore!.paginationTotalPages;

    if (pages > 1) {
      return (
        <Pagination
          pageCount={pages}
          onChangePage={this.onChangePage}
          page={teachingPathsListStore!.currentPage}
        />
      );
    }
  }

  public closeSlideOutPanel = (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
    this.setState({ isTeachingPathPreviewVisible: false });
    this.setState({ isTeachingPathPreviewTeacherCMVisible: false });
  }

  public renderSlideOutPanel = () => {
    const { teachingPathsListStore } = this.props;

    return (
      <div className="dark" onClick={this.closeSlideOutPanel}>
        <SideOutPanel
          store={teachingPathsListStore}
          onClose={this.closeSlideOutPanel}
        />
      </div>
    );
  }

  public renderSlideOutPanelTeacherCM = () => {
    const { teachingPathsListStore } = this.props;
    const { currentEntity } = teachingPathsListStore!;
    const { isPublishedCurrentTeachingPath, currentTeachingPathView } = this.state;
    const tempIsPublishedCurrentTeachingPath = isPublishedCurrentTeachingPath!;
    return (
      <div className="dark" onClick={this.closeSlideOutPanel}>
        <SideOutPanelPreviewTeachingPath
          view={currentTeachingPathView}
          isPublishedCurrentTeachingPath={tempIsPublishedCurrentTeachingPath}
          store={teachingPathsListStore}
          onClose={this.closeSlideOutPanel}
        />
      </div>
    );
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
    this.assigValueData('', '', '', '', '', '', '', true, true);
  }

  public render() {
    const { isTeachingPathPreviewVisible, isTeachingPathPreviewTeacherCMVisible } = this.state;
    const { teachingPathsListStore } = this.props;
    const teachingPaths = teachingPathsListStore!.teachingPathsState === StoreState.LOADING ?
      teachingPathsListStore!.teachingPathsForSkeleton :
      teachingPathsListStore!.teachingPathsList;
    const classCard = (teachingPaths.length > limitSplicePathname5) ? 'cardList' : 'cardList onlyOneLine' ;
    return (
      <div className="teachingPathsList moveListBySearchFilter TpList">
        <h1 className="generalTitle">
          {intl.get('teaching path search.title')}
        </h1>
        {this.renderTabNavigate()}
        <SearchFilter
          subject
          grade
          popularity
          isTeachingPathPage
          isStudentTpPage={this.props.isNotStudent}
          placeholder={intl.get('teaching path search.Search for teaching paths')}
          customLocalesList={this.state.optionsLocales}
          customSubjectsList={this.state.subjectsArrayFilter}
          customGradesList={this.state.gradesArrayFilter}
          customCoreTPList={this.state.optionsCore}
          customGoalsTPList={this.state.optionsGoals}
          customMultiList={this.state.optionsMulti}
          customReadingList={this.state.optionsReading}
          customSourceList={this.state.optionsSource}
          customGradeChildrenList={this.state.customGradeChildrenList}
          filtersisUsed={this.state.filtersisUsed}
          filtersAjaxLoading={this.state.filtersAjaxLoading}
          filtersAjaxLoadingGoals={this.state.filtersAjaxLoadingGoals}
          // METHODS
          handleChangeSubject={this.handleChangeSubject}
          handleChangeGrade={this.handleChangeGrade}
          handleChangeSorting={this.handleChangeSorting}
          handleChangeSelectCore={this.handleChangeSelectCore}
          handleChangeSelectGoals={this.handleChangeSelectGoals}
          handleInputSearchQuery={this.handleInputSearchQuery}
          handleClickReset={this.handleClickReset}
          handleClickLocale={this.handleClickLocale}
          handleClickGrade={this.handleClickGrade}
          handleClickSubject={this.handleClickSubject}
          handleClickMulti={this.handleClickMulti}
          handleClickReading={this.handleClickReading}
          handleClickSource={this.handleClickSource}
          handleClickChildrenGrade={this.handleClickChildrenGrade}
          // VALUES
          gradeFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.GRADE)}
          defaultValueLocaleFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.LOCALE)}
          defaultValueGradeFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.GRADE)}
          defaultValueSubjectFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.SUBJECT)}
          isAnsweredFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_ANSWERED)}
          isEvaluatedFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_EVALUATED)}
          orderFieldFilterValue={SortingFilter.CREATION_DATE}
          orderFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER)}
          searchQueryFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH)}
          coreFilterValueTP={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS)}
          defaultValueMainFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS)}
          goalsFilterValueTP={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREEPGOALSIDS)}
          defaultValueReadingFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT)}
          defaultValueSourceFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.SOURCE)}
          coreValueFilter={this.state.myValueCore}
          goalValueFilter={this.state.goalValueFilter}
        />

        <div className={classCard} aria-live="polite" id="List" aria-atomic="true">
          {this.renderTeachingPathCards()}
        </div>

        {this.renderPagination()}
        {isTeachingPathPreviewVisible && this.renderSlideOutPanel()}
        {isTeachingPathPreviewTeacherCMVisible && this.renderSlideOutPanelTeacherCM()}
      </div>
    );
  }
}

export const TeachingPathsList = withRouter(TeachingPathsListComponent);
