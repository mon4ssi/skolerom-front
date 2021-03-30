import React, { Component, ChangeEvent, SyntheticEvent, RefObject } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { ActivityFilter, BooleanFilter, SortingFilter } from 'utils/enums';
import { withResizeDetector } from 'react-resize-detector';
import isNumber from 'lodash/isNumber';

import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { Grade, Subject } from 'assignment/Assignment';
import { sortByAlphabet } from 'utils/sortByAlphabet';

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
  width?: number;

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
}

@inject('assignmentListStore')
@observer
class SearchFilter extends Component<Props, State> {
  private container: RefObject<HTMLDivElement> = React.createRef();

  private space: RefObject<HTMLDivElement> = React.createRef();

  public state = {
    displayWidthBreakpoint: 0
  };

  public componentDidMount() {
    const { assignmentListStore, customGradesList, customSubjectsList } = this.props;
    if (!customGradesList) {
      assignmentListStore!.getGrades();
    }

    if (!customSubjectsList) {
      assignmentListStore!.getSubjects();
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
      <select className="SearchFilter__select" onChange={handleChangeSubject} value={value}>
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
      <select className="SearchFilter__select" onChange={handleChangeEvaluationStatus} value={value}>
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
      orderFieldFilterValue
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
        {isStudent && this.renderEvaluationStatus()}
        {isStudent && this.renderAnswerStatus()}
        {subject && this.renderSubjects()}
        {!isStudent && grade && this.renderGrades()}
        {activity && this.renderActivity()}

        <div className="SearchFilter__space" ref={this.space}/>

        {!isStudent && date && this.renderDate()}
        {orderFieldFilterValue === SortingFilter.DEADLINE ? this.renderSorting() : popularity && this.renderPopularities()}
        <div className="SearchFilter__search__content">
          <input
            className="SearchFilter__search"
            placeholder={placeholder}
            value={myValue}
            onChange={searchQueryChange}
            aria-labelledby="searchfilterInput"
            id="SendFilter"
            aria-required="true"
            aria-invalid="false"
          />
          <label id="searchfilterInput" className="hidden">{placeholder}</label>
          <button id="ChangeForce" type="submit" className="SearchFilter__search__submit" onClick={handleInputSearchQuery} />
        </div>
      </div>
    );
  }
}

const resizeComponent = withResizeDetector(SearchFilter);
export { resizeComponent as SearchFilter };
