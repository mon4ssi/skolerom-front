import React, { Component, ChangeEvent, SyntheticEvent, RefObject } from 'react';
import Select from 'react-select';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { ActivityFilter, BooleanFilter, SortingFilter } from 'utils/enums';
import { withResizeDetector } from 'react-resize-detector';
import isNumber from 'lodash/isNumber';

import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { Grade, Subject, Greep, GreepSelectValue } from 'assignment/Assignment';
import { sortByAlphabet } from 'utils/sortByAlphabet';
import filterImg from 'assets/images/filter.svg';
import filterWhiteImg from 'assets/images/filter_white.svg';
import resetImg from 'assets/images/reset-icon.svg';
import gradeImg from 'assets/images/grade.svg';
import tagsImg from 'assets/images/tags.svg';
import cogsImg from 'assets/images/cogs.svg';
import coreImg from 'assets/images/core.svg';
import goalsImg from 'assets/images/goals.svg';
import voiceImg from 'assets/images/voice.svg';
import readingImg from 'assets/images/reading-second-icon.svg';
import './SearchFilter.scss';

const STYLE_ELEMENT_ID = 'STYLE_ELEMENT_ID';
const MAX_HEADER_HEIGHT = 70;

interface Props {
  assignmentListStore?: AssignmentListStore;
  isStudent?: boolean;
  placeholder: string;
  subject?: boolean;
  grade?: boolean;
  date?: boolean;
  activity?: boolean;
  popularity?: boolean;
  isTeachingPathPage?: boolean;
  isAssignmentsPathPage?: boolean;
  width?: number;
  isStudentTpPage?: boolean;
  isArticlesListPage?: boolean;
  isAssignmentsListPage?: boolean;
  isAssignmentsListFilter?: boolean;

  customGradesList?: Array<Grade>;
  customGradeChildrenList?: Array<Grade>;
  customSubjectsList?: Array<Subject>;
  showSourceFilter?: boolean;
  filtersisUsed?: boolean;
  filtersAjaxLoading?: boolean;
  filtersAjaxLoadingGoals?: boolean;

  subjectFilterValue?: string | number | null;
  gradeFilterValue?: string | number | null;
  coreFilterValue?: string | number | null;
  goalsFilterValue?: string | number | null;
  coreFilterValueTP?: string | number | null;
  mainFilterValueTP?: string | number | null;
  goalsFilterValueTP?: string | number | null;
  readingFilterValueTP?: string | number | null;

  defaultValueGradeFilter?: string | null;
  defaultValueSubjectFilter?: string | null;
  defaultValueMainFilter?: string | null;
  defaultValueReadingFilter?: string | null;
  defaultValueSourceFilter?: string | null;

  isAnsweredFilterValue?: string | null;
  isEvaluatedFilterValue?: string | null;
  orderFilterValue?: string | null;
  orderFieldFilterValue?: string | null;
  searchQueryFilterValue?: string | null;
  activityFilterValue?: number | null;

  customCoreList?: Array<Greep>;
  customMultiList?: Array<Greep>;
  customReadingList?: Array<Greep>;
  customGoalsList?: Array<Greep>;
  customSourceList?: Array<Greep>;

  coreValueFilter?: Array<any>;
  goalValueFilter?: Array<any>;

  customCoreTPList?: Array<GreepSelectValue>;
  customGoalsTPList?: Array<GreepSelectValue>;

  handleChangeSubject?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeActivity?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeGrade?(e: ChangeEvent<HTMLSelectElement>): void;
  switchNewestOldest?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeSorting?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeEvaluationStatus?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeAnswerStatus?(e: ChangeEvent<HTMLSelectElement>): void;
  handleInputSearchQuery?(e: SyntheticEvent): void;
  handleChangeSelectCore?(e: any): void;
  handleChangeSelectGoals?(e: any): void;

  handleClickGrade?(e: SyntheticEvent): void;
  handleClickSubject?(e: SyntheticEvent): void;
  handleClickMulti?(e: SyntheticEvent): void;
  handleClickSource?(e: SyntheticEvent): void;
  handleClickReset?(e: SyntheticEvent): void;
  handleClickReading?(e: SyntheticEvent): void;
  highLightGradeSubject?(): void;
}

interface State {
  displayWidthBreakpoint: number;
  filtersModal: boolean;
  filtersModalTp: boolean;
  filtersModalAssignment: boolean;
  filtersAssignment: boolean;
}

@inject('assignmentListStore')
@observer
class SearchFilter extends Component<Props, State> {
  private container: RefObject<HTMLDivElement> = React.createRef();
  private space: RefObject<HTMLDivElement> = React.createRef();
  private subjectRef: RefObject<HTMLSelectElement> = React.createRef();
  private evaluationRef: RefObject<HTMLSelectElement> = React.createRef();

  public state = {
    displayWidthBreakpoint: 0,
    filtersModal: false,
    filtersModalTp: false,
    filtersModalAssignment: false,
    filtersAssignment: false,
  };

  public componentDidMount() {
    const { isStudent, isAssignmentsPathPage, isTeachingPathPage, assignmentListStore, customGradesList, customSubjectsList } = this.props;
    if (!customGradesList) {
      assignmentListStore!.getGrades();
    }
    if (!customSubjectsList) {
      assignmentListStore!.getSubjects();
    }
    if (isTeachingPathPage) {
      if (this.subjectRef.current) {
        this.subjectRef.current!.focus();
      }
    }
    if (isAssignmentsPathPage) {
      if (isStudent) {
        if (this.evaluationRef.current) {
          this.evaluationRef.current!.focus();
        }
      } else {
        if (this.subjectRef.current) {
          this.subjectRef.current!.focus();
        }
      }
    }
    window.addEventListener('resize', this.handleResize);
    this.createOrUpdateStyleElement(0); // needed here to reset style from previous SearchFilter
    this.handleResize();
  }

  public componentWillUnmount(): void {
    window.removeEventListener('resize', this.handleResize);
  }

  public sortSelectors = (a: Grade, b: Grade) => a.id > b.id ? 1 : -1;

  public renderOptions = (option: Grade | Subject) => (
    <option key={option.id} value={option.id}>{option.title}</option>
  )

  public renderValueOptions = (data: Array<Greep>) => {
    const returnArray: Array<GreepSelectValue> = [];
    data.forEach((element) => {
      returnArray.push({
        // tslint:disable-next-line: variable-name
        value: Number(element.id),
        label: element.title
      });
    });
    return returnArray;
  }

  public renderSubjects = () => {
    const { assignmentListStore, handleChangeSubject, customSubjectsList, subjectFilterValue } = this.props;
    const subjects = (customSubjectsList || assignmentListStore!.getAllSubjects()).sort(sortByAlphabet).map(this.renderOptions);

    const value = subjectFilterValue || 0;

    return (
      <select className="SearchFilter__select" onChange={handleChangeSubject} value={value} ref={this.subjectRef} >
        <option key={0} value={0}>{intl.get('assignments search.Choose subject')}</option>
        {subjects}
      </select>
    );
  }

  public renderGrades = () => {
    const { assignmentListStore, handleChangeGrade, customGradesList, gradeFilterValue } = this.props;
    const grades = (customGradesList || assignmentListStore!.getAllGrades()).sort(this.sortSelectors).map(this.renderOptions);
    return (
      <select className="SearchFilter__select" onChange={handleChangeGrade} value={gradeFilterValue || 0}>
        <option key={0} value={0}>{intl.get('assignments search.Choose grade')}</option>
        {grades}
      </select>
    );
  }

  public renderActivity = () => {
    const { activityFilterValue, handleChangeActivity } = this.props;
    const value = isNumber(activityFilterValue) ? activityFilterValue : ActivityFilter.ALL;

    return (
      <select className="SearchFilter__select" value={value} onChange={handleChangeActivity}>
        <option value={ActivityFilter.ALL}>{intl.get('assignments search.choose activity')}</option>
        <option value={ActivityFilter.ACTIVE}>{intl.get('assignments search.active')}</option>
        <option value={ActivityFilter.INACTIVE}>{intl.get('assignments search.inactive')}</option>
      </select>
    );
  }

  public renderDate = () => (
    <select className="SearchFilter__select" onChange={this.props.switchNewestOldest}>
      <option value={SortingFilter.DESC}>{intl.get('assignments search.Newest')}</option>
      <option value={SortingFilter.ASC}>{intl.get('assignments search.Oldest')}</option>
    </select>
  )

  public renderPopularities = () => {
    const { orderFilterValue, orderFieldFilterValue, handleChangeSorting } = this.props;

    const value = orderFieldFilterValue && orderFilterValue ?
      `${orderFieldFilterValue} ${orderFilterValue}` :
      `${SortingFilter.CREATION_DATE} ${SortingFilter.DESC}`;

    const fieldFilter = orderFieldFilterValue || SortingFilter.CREATION_DATE;
    return (
      <select className="SearchFilter__select" value={value} onChange={handleChangeSorting}>
        <option value={`${fieldFilter} ${SortingFilter.DESC}`}>{intl.get('assignments search.Newest')}</option>
        <option value={`${fieldFilter} ${SortingFilter.ASC}`}>{intl.get('assignments search.Oldest')}</option>
      </select>
    );
  }

  public renderSorting = () => {
    const { handleChangeSorting, orderFilterValue, orderFieldFilterValue } = this.props;

    const value = orderFieldFilterValue && orderFilterValue ?
      `${orderFieldFilterValue} ${orderFilterValue}` :
      `${SortingFilter.DEADLINE} ${SortingFilter.DESC}`;

    return (
      <select className="SearchFilter__select SearchFilter__select_sorting" onChange={handleChangeSorting} value={value}>
        <option value={`${SortingFilter.DEADLINE} ${SortingFilter.ASC}`}>
          {intl.get('assignments search.Sort by deadline')} ({intl.get('assignments search.due_first').toLowerCase()})
        </option>
        <option value={`${SortingFilter.DEADLINE} ${SortingFilter.DESC}`}>
          {intl.get('assignments search.Sort by deadline')} ({intl.get('assignments search.due_last').toLowerCase()})
        </option>
      </select>
    );
  }

  public renderAnswerStatus = () => {
    const { handleChangeAnswerStatus, isAnsweredFilterValue } = this.props;

    const value = isAnsweredFilterValue || undefined;

    return (
      <select className="SearchFilter__select" onChange={handleChangeAnswerStatus} value={value}>
        <option>{intl.get('assignments search.Answer status')}</option>
        <option value={BooleanFilter.TRUE}>{intl.get('assignments search.Answered')}</option>
        <option value={BooleanFilter.FALSE}>{intl.get('assignments search.Not answered')}</option>
      </select>
    );
  }

  public renderEvaluationStatus = () => {
    const { handleChangeEvaluationStatus, isEvaluatedFilterValue } = this.props;

    const value = isEvaluatedFilterValue || undefined;

    return (
      <select className="SearchFilter__select" onChange={handleChangeEvaluationStatus} value={value} ref={this.evaluationRef}>
        <option>{intl.get('assignments search.Evaluation status')}</option>
        <option value={BooleanFilter.TRUE}>{intl.get('assignments search.Evaluated')}</option>
        <option value={BooleanFilter.FALSE}>{intl.get('assignments search.Not evaluated')}</option>
      </select>
    );
  }

  public handleResize = () => {
    const containerRect = this.container.current!.getBoundingClientRect();
    const spaceRect = this.space.current!.getBoundingClientRect();

    if (containerRect.height < MAX_HEADER_HEIGHT && spaceRect.width > 0 && !this.state.displayWidthBreakpoint) {
      const breakpoint = document.documentElement.clientWidth - spaceRect.width;
      this.setState({
        displayWidthBreakpoint: breakpoint,
      });
      this.createOrUpdateStyleElement(breakpoint);
    }

    if (containerRect.height > MAX_HEADER_HEIGHT && spaceRect.width > 0) {
      const breakpoint = document.documentElement.clientWidth;
      this.setState({
        displayWidthBreakpoint: breakpoint,
      });
      this.createOrUpdateStyleElement(breakpoint);
    }
  }

  public createOrUpdateStyleElement(breakpoint: number) {
    const element = document.getElementById(STYLE_ELEMENT_ID);
    if (element) {
      element.innerHTML = this.getStyles(breakpoint);
    } else {
      const style = document.createElement('style');
      style.id = STYLE_ELEMENT_ID;
      style.innerHTML = this.getStyles(breakpoint);
      document.getElementsByTagName('head')[0].appendChild(style);
    }
  }

  public getStyles(breakpoint: number) {
    return `
      @media screen and (max-width: ${breakpoint}px) {
        .SearchFilter {
          padding: 15px 0 0 15px;
        }

        .SearchFilter__space {
          display: none;
        }
        .SearchFilter__search__content {
          margin-left: 0px;
          width: 100%;
        }
        .SearchFilter__search {
          width: calc(100% - 34px);
          border-left: 0px;
          padding-left: 2px;
        }
        .SearchFilter__select {
          margin-right: 15px;
          flex: 1 1 calc(25% - 1em);
          margin-bottom: 15px;
        }
      }
    `;
  }

  public updateStyleElement() {
    document.getElementById(STYLE_ELEMENT_ID)!.innerHTML = this.getStyles(this.state.displayWidthBreakpoint);
  }

  public openFiltersModal = () => {
    const { filtersModal } = this.state;
    if (filtersModal) {
      this.setState({
        filtersModal: false
      });
    } else {
      this.setState(
        {
          filtersModal: true
        },
        () => {
          if (this.props.highLightGradeSubject) {
            this.props.highLightGradeSubject();
          }
        }
      );
    }
  }

  public closeFiltersModal = () => {
    this.setState({
      filtersModal: false
    });
  }

  public openFiltersAssignments = () => {
    const { filtersAssignment } = this.state;
    if (filtersAssignment) {
      this.setState({
        filtersAssignment: false
      });
    } else {
      this.setState({
        filtersAssignment: true
      });
    }
  }

  public closeFiltersAssignments = () => {
    this.setState({
      filtersAssignment: false
    });
  }

  public openFiltersModalTp = () => {
    const { filtersModalTp } = this.state;
    const moveListBySearchFilter = Array.from(document.getElementsByClassName('moveListBySearchFilter') as HTMLCollectionOf<HTMLElement>);
    if (filtersModalTp) {
      this.setState({
        filtersModalTp: false
      });
      moveListBySearchFilter[0].classList.remove('active');
    } else {
      this.setState({
        filtersModalTp: true
      });
      moveListBySearchFilter[0].classList.add('active');
    }
  }

  public closeFiltersModalTp = () => {
    this.setState({
      filtersModalTp: false
    });
    const moveListBySearchFilter = Array.from(document.getElementsByClassName('moveListBySearchFilter') as HTMLCollectionOf<HTMLElement>);
    moveListBySearchFilter[0].classList.remove('active');
  }

  public openFiltersModalAssignment = () => {
    const { filtersModalAssignment } = this.state;
    const moveListBySearchFilter = Array.from(document.getElementsByClassName('moveListBySearchFilter') as HTMLCollectionOf<HTMLElement>);
    if (filtersModalAssignment) {
      this.setState({
        filtersModalAssignment: false
      });
      moveListBySearchFilter[0].classList.remove('active');
    } else {
      this.setState({
        filtersModalAssignment: true
      });
      moveListBySearchFilter[0].classList.add('active');
    }
  }

  public closeFiltersModalAssignment = () => {
    this.setState({
      filtersModalAssignment: false
    });
    const moveListBySearchFilter = Array.from(document.getElementsByClassName('moveListBySearchFilter') as HTMLCollectionOf<HTMLElement>);
    moveListBySearchFilter[0].classList.remove('active');
  }

  public applyFiltersbutton() {
    const { filtersModal } = this.state;
    let buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_close');
    let buttonClass = 'closehandler';
    let imgFilter = filterImg;
    if (filtersModal) {
      buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_open');
      buttonClass = 'openhandler';
      imgFilter = filterWhiteImg;
    } else {
      if (this.props.filtersisUsed) {
        buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_change');
        buttonClass = 'openhandler';
        imgFilter = filterWhiteImg;
      }
    }
    return (
      <div className="SearchFilter__link">
        <a href="javascript:void(0)" className={buttonClass} onClick={this.openFiltersModal}>
          <img src={imgFilter} /> {buttonTxt}
        </a>
      </div>
    );
  }

  public applyFiltersTeachingPathbutton() {
    const { filtersModalTp } = this.state;
    let buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_close');
    let buttonClass = 'closehandler';
    let imgFilter = filterImg;
    if (filtersModalTp) {
      buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_open');
      buttonClass = 'openhandler';
      imgFilter = filterWhiteImg;
    } else {
      if (this.props.filtersisUsed) {
        buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_change');
        buttonClass = 'openhandler';
        imgFilter = filterWhiteImg;
      }
    }
    return (
      <div className="SearchFilter__link TpButton">
        <a href="javascript:void(0)" className={buttonClass} onClick={this.openFiltersModalTp}>
          <img src={imgFilter} /> {buttonTxt}
        </a>
      </div>
    );
  }

  public applyFiltersbuttonAssignments() {
    const { filtersModalAssignment } = this.state;
    let buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_close');
    let buttonClass = 'closehandler';
    let imgFilter = filterImg;
    if (filtersModalAssignment) {
      buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_open');
      buttonClass = 'openhandler';
      imgFilter = filterWhiteImg;
    } else {
      if (this.props.filtersisUsed) {
        buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_change');
        buttonClass = 'openhandler';
        imgFilter = filterWhiteImg;
      }
    }
    return (
      <div className="SearchFilter__link">
        <a href="javascript:void(0)" className={buttonClass} onClick={this.openFiltersModalAssignment}>
          <img src={imgFilter} /> {buttonTxt}
        </a>
      </div>
    );
  }

  public applyFiltersbuttonFilterAssignments() {
    const { filtersAssignment } = this.state;
    let buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_close');
    let buttonClass = 'closehandler';
    let imgFilter = filterImg;
    if (filtersAssignment) {
      buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_open');
      buttonClass = 'openhandler';
      imgFilter = filterWhiteImg;
    } else {
      if (this.props.filtersisUsed) {
        buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_change');
        buttonClass = 'openhandler';
        imgFilter = filterWhiteImg;
      }
    }
    return (
      <div className="SearchFilter__link">
        <a href="javascript:void(0)" className={buttonClass} onClick={this.openFiltersAssignments}>
          <img src={imgFilter} /> {buttonTxt}
        </a>
      </div>
    );
  }

  public renderFiltersGrade = () => {
    const { assignmentListStore, handleClickGrade, customGradesList, gradeFilterValue, defaultValueGradeFilter } = this.props;
    const grades = (customGradesList || assignmentListStore!.getAllGrades()).sort(this.sortSelectors);

    const arrayDefaults = (defaultValueGradeFilter) ? defaultValueGradeFilter.split(',') : [];

    const visibleGrades = grades.map((grade) => {
      const gradetitle: Array<string> = grade.title.split('.');
      let title:string = gradetitle[0];
      if (gradetitle.length > 1) { title = gradetitle[0] + intl.get('new assignment.grade'); }
      let classD = (arrayDefaults.includes(String(grade.id))) ? 'active' : '';
      if (grade.filterStatus === 'inactive') { classD += ' downlight'; }

      return (
        <button
          value={grade.id}
          className={`itemFlexFilter gradesFilterClass ${classD}`}
          onClick={handleClickGrade}
          key={grade.id}
        >
          {title}
        </button>
      );
    });
    if (grades.length === 0) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    return (
      <div className="gradesItems flexFilter">
        {visibleGrades}
      </div>
    );
  }

  public renderFiltersGradeChildren = () => {
    const { handleClickGrade, customGradeChildrenList, defaultValueGradeFilter } = this.props;
    const grades = customGradeChildrenList!.sort(this.sortSelectors);
    const arrayDefaults = (defaultValueGradeFilter) ? defaultValueGradeFilter.split(',') : [];
    const visibleGrades = grades.map((grade) => {
      let classD = (arrayDefaults[0] === String(grade.id) ? 'active' : '');
      if (grade.filterStatus === 'inactive') { classD += ' downlight'; }
      return (
        <button
          value={grade.id}
          className={`itemFlexFilter gradesFilterClass ${classD} jrGradeChild`}
          onClick={handleClickGrade}
          key={grade.id}
        >
          {grade.title}
        </button>
      );
    });
    if (grades.length === 0) {
      return ('');
    }
    return (
      <div className="FiltersModal__body__item">
        <div className="itemFilter">
          <div className="itemFilter__leftWithoutIcon">
            &nbsp;
          </div>
          <div className="itemFilter__right">
            <div className="itemFilter__core">
              <div className="gradesItems flexFilter">
                {visibleGrades}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  public renderFiltersSubject = () => {
    const { assignmentListStore, handleClickSubject, customSubjectsList, subjectFilterValue, defaultValueSubjectFilter } = this.props;
    const subjects = (customSubjectsList || assignmentListStore!.getAllSubjects()).sort(sortByAlphabet);
    const arrayDefaults = (defaultValueSubjectFilter) ? defaultValueSubjectFilter.split(',') : [];

    const visibleSubjects = subjects.map((subject) => {

      const title = subject.title.split('.', 1);
      let classD = (arrayDefaults.includes(String(subject.id))) ? 'active' : '';
      if (subject.filterStatus === 'inactive') { classD += ' downlight'; }
      return <button value={subject.id} className={`itemFlexFilter subjectsFilterClass ${classD}`} onClick={handleClickSubject} key={subject.id}>{title}</button>;
    });
    if (subjects.length === 0) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    return (
      <div className="subjectsItems flexFilter">
        {visibleSubjects}
      </div>
    );
  }

  public renderFiltersCore = () => {
    const { handleChangeSelectCore, customCoreList, coreValueFilter } = this.props;
    const options = this.renderValueOptions(customCoreList!.sort(sortByAlphabet));
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      }),
      multiValue: () => ({
        fontSize: '16px',
        display: 'flex',
        borderRadius: '5px',
        background: 'rgb(230, 230, 230)',
        marginRight: '3px',
        marginBottom: '3px',
        maxWidth: '100%'
      })
    };
    if (this.props.filtersAjaxLoading) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    if (options.length === 0) {
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    }
    const NoOptionsMessage = () => {
      const { coreValueFilter } = this.props;
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    };
    return (
      <Select
        width="320px"
        components={{ NoOptionsMessage }}
        styles={customStyles}
        options={options}
        onChange={handleChangeSelectCore}
        placeholder={intl.get('new assignment.greep.core')}
        defaultValue={coreValueFilter}
        isClearable={true}
        isMulti
      />
    );
  }

  public renderFiltersCoreTP = () => {
    const { handleChangeSelectCore, customCoreTPList, coreValueFilter } = this.props;
    const options = customCoreTPList!;
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      }),
      multiValue: () => ({
        fontSize: '16px',
        display: 'flex',
        borderRadius: '5px',
        background: 'rgb(230, 230, 230)',
        marginRight: '3px',
        marginBottom: '3px',
        maxWidth: '100%'
      })
    };
    if (this.props.filtersAjaxLoading) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    if (typeof (options) !== 'undefined') {
      if (options.length === 0) {
        return (
          <div className="centerMin">
            {intl.get('edit_teaching_path.no_options')}
          </div>
        );
      }
    }
    const NoOptionsMessage = () => {
      const { coreValueFilter } = this.props;
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    };
    return (
      <Select
        width="320px"
        components={{ NoOptionsMessage }}
        styles={customStyles}
        options={options}
        onChange={handleChangeSelectCore}
        placeholder={intl.get('new assignment.greep.core')}
        defaultValue={coreValueFilter}
        isClearable={false}
        isMulti
      />
    );
  }

  public renderFiltersCoreAssignments = () => {
    const { handleChangeSelectCore, customCoreTPList, coreValueFilter } = this.props;
    const options = customCoreTPList!;
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      }),
      multiValue: () => ({
        fontSize: '16px',
        display: 'flex',
        borderRadius: '5px',
        background: 'rgb(230, 230, 230)',
        marginRight: '3px',
        marginBottom: '3px',
        maxWidth: '100%'
      })
    };
    if (this.props.filtersAjaxLoading) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    if (typeof (options) !== 'undefined') {
      if (options.length === 0) {
        return (
          <div className="centerMin">
            {intl.get('edit_teaching_path.no_options')}
          </div>
        );
      }
    }
    const NoOptionsMessage = () => {
      const { coreValueFilter } = this.props;
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    };
    return (
      <Select
        width="320px"
        components={{ NoOptionsMessage }}
        styles={customStyles}
        options={options}
        onChange={handleChangeSelectCore}
        placeholder={intl.get('new assignment.greep.core')}
        defaultValue={coreValueFilter}
        isMulti
        isClearable={false}
      />
    );
  }

  public renderFiltersMulti = () => {
    const { handleClickMulti, customMultiList, mainFilterValueTP, defaultValueMainFilter, coreFilterValue } = this.props;
    const cores = customMultiList!.sort(sortByAlphabet);

    const arrayDefaults = (defaultValueMainFilter) ? defaultValueMainFilter.split(',') : [];

    const visibleCores = cores.map((core, idx) => {
      const title = core.title;
      const classD = (arrayDefaults.includes(String(core.id))) ? 'active' : '';
      let alt = (typeof(core.alt) !== 'undefined') ? core.alt : '';
      if (classD === '' && alt === 'jrDelItem') { alt = 'hidden'; }
      return <button value={core.id} className={`itemFlexFilter multiFilterClass ${classD} ${alt}`} onClick={handleClickMulti} key={core.id}>{title}</button>;
    });
    if (this.props.filtersAjaxLoading) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    if (cores.length === 0) {
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    }
    return (
      <div className="coresItems flexFilter">
        {visibleCores}
      </div>
    );
  }

  public renderFilterReadingInSubject = () => {
    const { handleClickReading, customReadingList, readingFilterValueTP, defaultValueReadingFilter } = this.props;
    const cores = customReadingList!.sort(sortByAlphabet);
    const arrayDefaults = (defaultValueReadingFilter) ? defaultValueReadingFilter.split(',') : [];
    const visibleCores = cores.map((core) => {
      const title = core.title;
      const classD = (arrayDefaults.includes(String(core.id))) ? 'active' : '';
      return <button value={core.id} className={`itemFlexFilter sourceFilterClass ${classD}`} onClick={handleClickReading} key={core.id}>{title}</button>;
    });
    if (this.props.filtersAjaxLoading) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    if (cores.length === 0) {
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    }
    return (
      <div className="coresItems flexFilter">
        {visibleCores}
      </div>
    );
  }

  public renderFiltersGoals = () => {
    const { handleChangeSelectGoals, goalValueFilter, customGoalsList } = this.props;
    const options = this.renderValueOptions(customGoalsList!.sort(sortByAlphabet));
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      }),
      multiValue: () => ({
        fontSize: '16px',
        display: 'flex',
        borderRadius: '5px',
        background: 'rgb(230, 230, 230)',
        marginRight: '3px',
        marginBottom: '3px',
        maxWidth: '100%'
      })
    };
    if (this.props.filtersAjaxLoadingGoals) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    if (options.length === 0) {
      return (
        <p className="NotData">
          {intl.get('edit_teaching_path.header.notdata_goals')}
        </p>
      );
    }
    const NoOptionsMessage = () => {
      const { coreValueFilter } = this.props;
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    };
    return (
      <Select
        width="320px"
        components={{ NoOptionsMessage }}
        styles={customStyles}
        options={options}
        onChange={handleChangeSelectGoals}
        placeholder={intl.get('new assignment.greep.goals')}
        defaultValue={goalValueFilter}
        isMulti
        isClearable={false}
      />
    );
  }

  public renderFiltersGoalsTP = () => {
    const { handleChangeSelectGoals, goalValueFilter, customGoalsTPList } = this.props;
    const options = customGoalsTPList!;
    const customStyles = {
      option: () => ({
        fontSize: '14px',
        padding: '5px',
        borderBottom: '1px solid #e7ecef',
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        borderRadius: '5px',
        border: '1px solid #939fa7',
        color: '#0B2541',
        fontSize: '14px',
        background: '#E7ECEF',
        padding: '3px'
      }),
      multiValue: () => ({
        fontSize: '16px',
        display: 'flex',
        borderRadius: '5px',
        background: 'rgb(230, 230, 230)',
        marginRight: '3px',
        marginBottom: '3px',
        maxWidth: '100%'
      })
    };
    if (this.props.filtersAjaxLoadingGoals) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    if (options.length === 0) {
      return (
        <p className="NotData">
          {intl.get('edit_teaching_path.header.notdata_goals')}
        </p>
      );
    }
    const NoOptionsMessage = () => {
      const { coreValueFilter } = this.props;
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    };
    return (
      <Select
        width="320px"
        components={{ NoOptionsMessage }}
        styles={customStyles}
        options={options}
        onChange={handleChangeSelectGoals}
        placeholder={intl.get('new assignment.greep.goals')}
        defaultValue={goalValueFilter}
        isMulti
        isClearable={false}
      />
    );
  }

  public renderFiltersSource = () => {
    const { handleClickSource, customSourceList, defaultValueSourceFilter } = this.props;
    const cores = customSourceList!.sort(sortByAlphabet);
    const arrayDefaults = (defaultValueSourceFilter) ? defaultValueSourceFilter.split(',') : [];

    const visibleCores = cores.map((core) => {
      const title = core.title;
      const classD = (arrayDefaults.includes(String(core.id))) ? 'active' : '';
      let alt = (typeof(core.alt) !== 'undefined') ? core.alt : '';
      if (classD === '' && alt === 'jrDelItem') { alt = 'hidden'; }
      return <button value={core.id} className={`itemFlexFilter sourceFilterClass ${classD} ${alt}`} onClick={handleClickSource} key={core.id}>{title}</button>;
    });
    if (this.props.filtersAjaxLoading) {
      return (
        <div className="minimalLoading">
          <span /><span /><span />
        </div>
      );
    }
    if (cores.length === 0) {
      return (
        <div className="centerMin">
          {intl.get('edit_teaching_path.no_options')}
        </div>
      );
    }
    return (
      <div className="coresItems flexFilter">
        {visibleCores}
      </div>
    );
  }

  public renderFiltersContentSource = () =>
  (
    <div className="FiltersModal__body__item">
      <div className="itemFilter">
        <div className="itemFilter__left">
          <img src={voiceImg} />
        </div>
        <div className="itemFilter__right">
          <h3>{intl.get('new assignment.greep.source')}</h3>
          <div className="itemFilter__core">
            {this.renderFiltersSource()}
          </div>
        </div>
      </div>
    </div>
  )

  public modalFilters() {
    const { handleClickReset, showSourceFilter } = this.props;
    return (
      <div className="FiltersModal articleAssigModal">
        <div className="FiltersModal__header">
          <h5>{intl.get('edit_teaching_path.modals.search.header.title')}</h5>
          <button onClick={handleClickReset}>
            <img src={resetImg} />
            <span>{intl.get('edit_teaching_path.modals.search.header.button')}</span>
          </button>
        </div>
        <div className="FiltersModal__body">
        <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={gradeImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('generals.grade')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersGrade()}
                </div>
              </div>
            </div>
          </div>
          {this.renderFiltersGradeChildren()}
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={tagsImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('new assignment.Subject')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersSubject()}
                </div>
              </div>
            </div>
          </div>
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={coreImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('new assignment.greep.core')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersCore()}
                </div>
              </div>
            </div>
          </div>
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={cogsImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('new assignment.greep.subjects')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersMulti()}
                </div>
              </div>
            </div>
          </div>
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={goalsImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('new assignment.greep.goals')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersGoals()}
                </div>
              </div>
            </div>
          </div>
          {showSourceFilter && this.renderFiltersContentSource()}
        </div>
        <div className="FiltersModal__backgroundside" onClick={this.closeFiltersModal} />
      </div>
    );
  }

  public modalFiltersTp() {
    const { handleClickReset } = this.props;
    return (
      <div className="fixedsModal TPFiltersMain">
        <div className="FiltersModal">
          <div className="FiltersModal__header">
            <h5>{intl.get('edit_teaching_path.modals.search.header.title')}</h5>
            <button onClick={handleClickReset}>
              <img src={resetImg} />
              <span>{intl.get('edit_teaching_path.modals.search.header.button')}</span>
            </button>
          </div>
          <div className="FiltersModal__body">
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={gradeImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('generals.grade')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersGrade()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={tagsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.Subject')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersSubject()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={coreImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.core')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersCoreTP()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={cogsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.subjects')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersMulti()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={goalsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.goals')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersGoalsTP()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={readingImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.reading')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFilterReadingInSubject()}
                  </div>
                </div>
              </div>
            </div>
            {this.renderFiltersContentSource()}
          </div>
        </div>
        <div className="filtersModalBackground" onClick={this.closeFiltersModalTp} />
      </div>
    );
  }

  public modalFiltersAssignments() {
    const { handleClickReset } = this.props;
    return (
      <div className="fixedsModal assig">
        <div className="FiltersModal">
          <div className="FiltersModal__header">
            <h5>{intl.get('edit_teaching_path.modals.search.header.title')}</h5>
            <button onClick={handleClickReset}>
              <img src={resetImg} />
              <span>{intl.get('edit_teaching_path.modals.search.header.button')}</span>
            </button>
          </div>
          <div className="FiltersModal__body">
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={gradeImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('generals.grade')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersGrade()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={tagsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.Subject')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersSubject()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={coreImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.core')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersCoreAssignments()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={cogsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.subjects')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersMulti()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={goalsImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.goals')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFiltersGoalsTP()}
                  </div>
                </div>
              </div>
            </div>
            <div className="FiltersModal__body__item">
              <div className="itemFilter">
                <div className="itemFilter__left">
                  <img src={readingImg} />
                </div>
                <div className="itemFilter__right">
                  <h3>{intl.get('new assignment.greep.reading')}</h3>
                  <div className="itemFilter__core">
                    {this.renderFilterReadingInSubject()}
                  </div>
                </div>
              </div>
            </div>
            {this.renderFiltersContentSource()}
          </div>
        </div>
        <div className="filtersModalBackground" onClick={this.closeFiltersModalAssignment} />
      </div>
    );
  }

  public filtersAssignments() {
    const { handleClickReset } = this.props;
    return (
      <div className="FiltersModal articleAssig">
        <div className="FiltersModal__header">
          <h5>{intl.get('edit_teaching_path.modals.search.header.title')}</h5>
          <button onClick={handleClickReset}>
            <img src={resetImg} />
            <span>{intl.get('edit_teaching_path.modals.search.header.button')}</span>
          </button>
        </div>
        <div className="FiltersModal__body">
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={gradeImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('generals.grade')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersGrade()}
                </div>
              </div>
            </div>
          </div>
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={tagsImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('new assignment.Subject')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersSubject()}
                </div>
              </div>
            </div>
          </div>
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={coreImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('new assignment.greep.core')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersCoreTP()}
                </div>
              </div>
            </div>
          </div>
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={cogsImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('new assignment.greep.subjects')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersMulti()}
                </div>
              </div>
            </div>
          </div>
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={goalsImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('new assignment.greep.goals')}</h3>
                <div className="itemFilter__core">
                  {this.renderFiltersGoalsTP()}
                </div>
              </div>
            </div>
          </div>
          <div className="FiltersModal__body__item">
            <div className="itemFilter">
              <div className="itemFilter__left">
                <img src={readingImg} />
              </div>
              <div className="itemFilter__right">
                <h3>{intl.get('new assignment.greep.reading')}</h3>
                <div className="itemFilter__core">
                  {this.renderFilterReadingInSubject()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="FiltersModal__backgroundside assigFiltersModal" onClick={this.closeFiltersAssignments} />
      </div>
    );
  }

  public render() {
    const {
      isStudent,
      placeholder,
      handleInputSearchQuery,
      grade,
      subject,
      date,
      popularity,
      searchQueryFilterValue,
      activity,
      orderFieldFilterValue,
      isArticlesListPage,
      isStudentTpPage,
      isAssignmentsListPage,
      isAssignmentsListFilter
    } = this.props;
    let myValue: any;
    const searchQueryValue = searchQueryFilterValue || '';
    const searchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      myValue = newValue;
      const inputTag = document.getElementById('ChangeForce') as HTMLInputElement;
      inputTag.value = myValue;
    };
    return (
      <div className="SearchFilter" aria-controls="List" ref={this.container}>
        {!isArticlesListPage && !isStudentTpPage && isStudent && this.renderEvaluationStatus()}
        {!isArticlesListPage && !isStudentTpPage && isStudent && this.renderAnswerStatus()}
        {!isArticlesListPage && !isStudentTpPage && isStudent && subject && this.renderSubjects()}
        {!isArticlesListPage && !isStudentTpPage && !isStudent && grade && this.renderGrades()}
        {!isArticlesListPage && !isStudentTpPage && activity && this.renderActivity()}

        {isStudentTpPage && this.applyFiltersTeachingPathbutton()}
        {isArticlesListPage && this.applyFiltersbutton()}
        {this.state.filtersModal && this.modalFilters()}
        {this.state.filtersModalTp && this.modalFiltersTp()}
        {isAssignmentsListPage && !isStudent && this.applyFiltersbuttonAssignments()}
        {this.state.filtersModalAssignment && this.modalFiltersAssignments()}
        {isAssignmentsListFilter && !isStudent && this.applyFiltersbuttonFilterAssignments()}
        {this.state.filtersAssignment && this.filtersAssignments()}
        <div className="SearchFilter__space" ref={this.space} />

        {!isStudent && date && this.renderDate()}
        {orderFieldFilterValue === SortingFilter.DEADLINE ? this.renderSorting() : popularity && this.renderPopularities()}
        <div className="SearchFilter__search__content">
          <input
            className="SearchFilter__search"
            placeholder={placeholder}
            value={searchQueryValue}
            onChange={handleInputSearchQuery}
            aria-labelledby="searchfilterInput"
            id="SendFilter"
            aria-required="true"
            aria-invalid="false"
          />
          <label id="searchfilterInput" className="hidden">{placeholder}</label>
          <div id="ChangeForce" className="SearchFilter__search__submit" />
        </div>
      </div>
    );
  }
}

const resizeComponent = withResizeDetector(SearchFilter);
export { resizeComponent as SearchFilter };
