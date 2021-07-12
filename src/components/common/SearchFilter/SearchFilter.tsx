import React, { Component, ChangeEvent, SyntheticEvent, RefObject } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { ActivityFilter, BooleanFilter, SortingFilter } from 'utils/enums';
import { withResizeDetector } from 'react-resize-detector';
import isNumber from 'lodash/isNumber';

import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { Grade, Subject } from 'assignment/Assignment';
import { sortByAlphabet } from 'utils/sortByAlphabet';
import filterImg from 'assets/images/filter.svg';
import filterWhiteImg from 'assets/images/filter_white.svg';
import resetImg from 'assets/images/reset-icon.svg';

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
  isArticlesListPage?: boolean;
  isAssignmentsListPage?: boolean;

  customGradesList?: Array<Grade>;
  customSubjectsList?: Array<Subject>;

  subjectFilterValue?: number | null;
  gradeFilterValue?: number | null;
  isAnsweredFilterValue?: string | null;
  isEvaluatedFilterValue?: string | null;
  orderFilterValue?: string | null;
  orderFieldFilterValue?: string | null;
  searchQueryFilterValue?: string | null;
  activityFilterValue?: number | null;

  handleChangeSubject?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeActivity?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeGrade?(e: ChangeEvent<HTMLSelectElement>): void;
  switchNewestOldest?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeSorting?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeEvaluationStatus?(e: ChangeEvent<HTMLSelectElement>): void;
  handleChangeAnswerStatus?(e: ChangeEvent<HTMLSelectElement>): void;
  handleInputSearchQuery?(e: SyntheticEvent): void;
}

interface State {
  displayWidthBreakpoint: number;
  filtersModal: boolean;
  filtersisUsed: boolean;
}

@inject('assignmentListStore')
@observer
class SearchFilter extends Component<Props, State> {
  private container: RefObject<HTMLDivElement> = React.createRef();
  private space: RefObject<HTMLDivElement> = React.createRef();
  private subjectRef: RefObject<HTMLSelectElement> = React.createRef();
  private evaluationRef: RefObject<HTMLSelectElement> = React.createRef();
  private filtersModalRef: RefObject<HTMLButtonElement> = React.createRef();

  public state = {
    displayWidthBreakpoint: 0,
    filtersModal: false,
    filtersisUsed: false
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
      `${SortingFilter.DEADLINE} ${SortingFilter.ASC}`;

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
      this.setState({
        filtersModal: true
      });
    }
  }

  public closeFiltersModal = () => {
    this.setState({
      filtersModal: false
    });
  }

  public applyFiltersbutton() {
    const { filtersModal, filtersisUsed } = this.state;
    let buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_close');
    let buttonClass = 'closehandler';
    let imgFilter = filterImg;
    if (filtersModal) {
      buttonTxt = intl.get('edit_teaching_path.modals.search.buttons.button_open');
      buttonClass = 'openhandler';
      imgFilter = filterWhiteImg;
    } else {
      if (filtersisUsed) {
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

  public modalFilters() {
    const { filtersModal } = this.state;
    if (this.filtersModalRef.current) {
      this.filtersModalRef.current!.focus();
    }
    return (
      <div className="FiltersModal">
        <div className="FiltersModal__header">
          <h5>{intl.get('edit_teaching_path.modals.search.header.title')}</h5>
          <button ref={this.filtersModalRef}>
            <img src={resetImg} />
            <span>{intl.get('edit_teaching_path.modals.search.header.button')}</span>
          </button>
        </div>
        <div className="FiltersModal__body">
          testing
        </div>
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
      isAssignmentsListPage
    } = this.props;
    let myValue : any;
    const searchQueryValue = searchQueryFilterValue || '';
    const searchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      myValue = newValue;
      const inputTag = document.getElementById('ChangeForce') as HTMLInputElement;
      inputTag.value = myValue;
    };
    return (
      <div className="SearchFilter" aria-controls="List" ref={this.container}>
        {!isArticlesListPage && isStudent && this.renderEvaluationStatus()}
        {!isArticlesListPage && isStudent && this.renderAnswerStatus()}
        {!isArticlesListPage && subject && this.renderSubjects()}
        {!isArticlesListPage && !isStudent && grade && this.renderGrades()}
        {!isArticlesListPage && activity && this.renderActivity()}

        {isArticlesListPage &&  this.applyFiltersbutton()}
        {this.state.filtersModal && this.modalFilters()}
        <div className="SearchFilter__space" ref={this.space}/>

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
