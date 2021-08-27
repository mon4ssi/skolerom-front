import React, { Component, SyntheticEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import debounce from 'lodash/debounce';

import { TeachingPathsListStore } from './TeachingPathsListStore';
import { GrepElementFilters, FilterGrep, GreepSelectValue, GrepFilters, GoalsData, Greep, GreepElements } from 'assignment/Assignment';
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

const MAGICNUMBER100 = -1;
const MAGICNUMBER1 = 1;
const limitSplicePathname = 4;
const limitIndex = 2;

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
  selectedCoresAll: Array<GrepElementFilters>;
  selectedCoresFilter: Array<GrepElementFilters>;
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
  myValueGrade: Array<number>;
  myValueSubject: Array<number>;
  myValueMulti: Array<number>;
  myValueReading: Array<number>;
  myValueCore: Array<any>;
  goalValueFilter: Array<any>;
  filtersisUsed: boolean;
}

@inject('teachingPathsListStore', 'editTeachingPathStore')
@observer
class TeachingPathsListComponent extends Component<Props, State> {
  private tabNavigationLinks = [
    {
      name: 'All teaching paths',
      url: '/teaching-paths/all'
    },
    {
      name: 'My teaching paths',
      url: '/teaching-paths/my'
    },
    // {
    //   name: 'My school',
    //   url: '/teacher/teaching-paths/school'
    // },
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
      selectedCoresAll: [],
      selectedCoresFilter: [],
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
      myValueGrade: [],
      myValueSubject: [],
      myValueMulti: [],
      myValueReading: [],
      myValueCore: [],
      goalValueFilter: [],
      filtersisUsed: false,
    };
  }

  public unregisterListener: () => void = () => undefined;

  public fetchTeachingPaths() {
    const { filter } = this.props.teachingPathsListStore!;

    filter.page = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE, 1);
    filter.grade = QueryStringHelper.getString(this.props.history, QueryStringKeys.GRADE);
    filter.subject = QueryStringHelper.getString(this.props.history, QueryStringKeys.SUBJECT);
    filter.grepCoreElementsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS);
    filter.grepMainTopicsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS);
    filter.grepGoalsIds = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREEPGOALSIDS);
    filter.grepReadingInSubject = QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT);
    filter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH);
    filter.order = QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER, SortingFilter.DESC);
    filter.orderField = SortingFilter.CREATION_DATE;

    if (filter.subject || filter.grade || filter.grepCoreElementsIds || filter.grepMainTopicsIds || filter.grepGoalsIds || filter.grepReadingInSubject) {
      this.setState({ filtersisUsed: true });
    } else {
      this.setState({ filtersisUsed: false });
    }

    this.props.teachingPathsListStore!.getTeachingPathsList();
  }

  public async assigValueData(grades: string, subjects: string) {
    const { editTeachingPathStore } = this.props;
    const grepFiltersDataAwait = await editTeachingPathStore!.getGrepFilters(grades, subjects);
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
  }

  public async componentDidMount() {
    const { editTeachingPathStore } = this.props;
    const { valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions } = this.state;
    this.setCurrentTab();
    this.fetchTeachingPaths();
    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
    document.addEventListener('keyup', this.handleKeyboardControl);
    this.assigValueData('', '');
    const listGoals = [''];
    this.setState({
      valueStringGoalsOptions: listGoals
    });
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, valueGradesOptions, valueSubjectsOptions, listGoals, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
  }

  public transformDataToString = (data: Array<GreepElements>) => {
    const returnArray : Array<string> = [];
    data!.forEach((element) => {
      returnArray.push(element.kode);
    });
    return returnArray;
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

  public openAssignmentPreview = (id: number) => {
    this.unregisterListener();
    this.props.teachingPathsListStore!.setCurrentTeachingPath(id);
    this.setState({ isTeachingPathPreviewVisible: true });
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
        if (view === 'show') {
          history.push(`/teaching-paths/view/${id}`);
          break;
        }
        history.push(`/teaching-paths/edit/${id}`);
        break;
      case UserType.Student:
        this.openAssignmentPreview(id);
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
    const { optionsGrades, valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    const valueSelectedGrades = this.state.myValueGrade;
    const value = e.currentTarget.value;
    const valueToArray: Array<number> = [];
    if (!valueSelectedGrades!.includes(Number(value))) {
      e.currentTarget.classList.add('active');
      valueSelectedGrades!.push(Number(value));
    } else {
      e.currentTarget.classList.remove('active');
      const indexSelected = valueSelectedGrades!.indexOf(Number(value));
      if (indexSelected > -1) {
        valueSelectedGrades!.splice(indexSelected, 1);
      }
    }
    this.setState({
      myValueGrade: valueSelectedGrades
    });
    optionsGrades!.forEach((element) => {
      valueSelectedGrades.forEach((el) => {
        if (Number(element.wp_id) === Number(el)) {
          valueToArray.push(element.id);
          this.setState({ valueGradesOptions: valueToArray });
        }
      });
    });
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GRADE,
      String(valueSelectedGrades)
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    this.assigValueData(String(valueToArray), String(valueSubjectsOptions));
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, valueToArray, valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
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
    this.assigValueData(String(valueGradesOptions), String(valueToArray));
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, valueMultiOptions, valueGradesOptions, valueToArray, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
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
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(valueCoreOptions, valueSelectedMulti, valueGradesOptions, valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
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

  public handleChangeSelectCore = async (newValue: Array<any>) => {
    const ArrayValue: Array<number> = [];
    const { editTeachingPathStore } = this.props;
    const { valueSubjectsOptions, valueCoreOptions, valueMultiOptions, valueGradesOptions } = this.state;
    this.setState({ myValueCore: newValue });
    newValue.forEach((e) => {
      ArrayValue.push(e.value);
    });
    this.setState({ valueCoreOptions: ArrayValue });
    const grepFiltergoalssDataAwait = await editTeachingPathStore!.getGrepGoalsFilters(ArrayValue, valueMultiOptions, valueGradesOptions, valueSubjectsOptions, this.state.valueStringGoalsOptions, MAGICNUMBER100, MAGICNUMBER1);
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

  public handleChangeSelectGoals = async (newValue: Array<any>) => {
    const ArrayValue: Array<number> = [];
    newValue.forEach((e) => {
      ArrayValue.push(e.value);
    });
    this.setState({ valueGoalsOptions: ArrayValue });
    this.setState({ goalValueFilter: newValue });
    let singleString : string = '';
    if (newValue.length > 0) {
      newValue.forEach((e, index) => {
        singleString = (index === 0) ? String(e.value) : `${singleString},${String(e.value)}`;
      });
    }
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
    const { readOnly } = this.props;

    if (!readOnly) {
      return (
        <TabNavigation
          textMainButton={intl.get('teaching_path_tabs.new teaching path')}
          onClickMainButton={this.createTeachingPath}
          tabNavigationLinks={this.tabNavigationLinks}
          sourceTranslation={'teaching_path_tabs'}
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
        <SkeletonLoader key={index} className="InfoCard" />
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
    const grepFiltergoalssDataAwait = await this.props.editTeachingPathStore!.getGrepGoalsFilters([], [], [], [], [], MAGICNUMBER100, MAGICNUMBER1);
    this.setState({
      optionsGoals : this.renderValueOptionsGoals(grepFiltergoalssDataAwait.data)
    });
    this.setState({ valueGradesOptions: [] });
    this.setState({ valueCoreOptions: [] });
    this.setState({ valueMultiOptions: [] });
    this.setState({ filtersisUsed: false });
  }

  public render() {
    const { isTeachingPathPreviewVisible } = this.state;
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
          customCoreTPList={this.state.optionsCore}
          customGoalsTPList={this.state.optionsGoals}
          customMultiList={this.state.optionsMulti}
          customReadingList={this.state.optionsReading}
          filtersisUsed={this.state.filtersisUsed}
          // METHODS
          handleChangeSubject={this.handleChangeSubject}
          handleChangeGrade={this.handleChangeGrade}
          handleChangeSorting={this.handleChangeSorting}
          handleChangeSelectCore={this.handleChangeSelectCore}
          handleChangeSelectGoals={this.handleChangeSelectGoals}
          handleInputSearchQuery={this.handleInputSearchQuery}
          handleClickReset={this.handleClickReset}
          handleClickGrade={this.handleClickGrade}
          handleClickSubject={this.handleClickSubject}
          handleClickMulti={this.handleClickMulti}
          handleClickReading={this.handleClickReading}
          // VALUES
          defaultValueGradeFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.GRADE)}
          defaultValueSubjectFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.SUBJECT)}
          isAnsweredFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_ANSWERED)}
          isEvaluatedFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.IS_EVALUATED)}
          orderFieldFilterValue={SortingFilter.CREATION_DATE}
          orderFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.ORDER)}
          searchQueryFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH)}
          coreFilterValueTP={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREPCOREELEMENTSIDS)}
          defaultValueMainFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPMAINTOPICSIDS)}
          goalsFilterValueTP={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GREEPGOALSIDS)}
          defaultValueReadingFilter={QueryStringHelper.getString(this.props.history, QueryStringKeys.GREPREADINGINSUBJECT)}
          coreValueFilter={this.state.myValueCore}
          goalValueFilter={this.state.goalValueFilter}
        />

        <div className="cardList" aria-live="polite" id="List" aria-atomic="true">
          {this.renderTeachingPathCards()}
        </div>

        {this.renderPagination()}
        {isTeachingPathPreviewVisible && this.renderSlideOutPanel()}
      </div>
    );
  }
}

export const TeachingPathsList = withRouter(TeachingPathsListComponent);
