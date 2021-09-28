import React, { ChangeEvent, Component } from 'react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { StudentOverviewHeader } from '../StudentOverviewHeader/StudentOverviewHeader';
import { StudentsListStore } from 'student/StudentsListStore';
import { StudentAssignment } from './StudentAssignment';
import { Assignment } from 'assignment/Assignment';

import { lettersNoEn } from 'utils/lettersNoEn';
import { BooleanFilter, SortingFilter, StoreState } from 'utils/enums';

import './StudentAssignments.scss';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { UIStore } from 'locales/UIStore';

interface Props extends RouteComponentProps {
  studentsListStore?: StudentsListStore;
  uiStore?: UIStore;
}

@inject('studentsListStore', 'uiStore')
@observer
class StudentAssignments extends Component<Props> {
  public ref = React.createRef<HTMLDivElement>();

  public async componentDidMount() {
    const { studentsListStore } = this.props;

    studentsListStore!.setAssignmentsFilterSorting(SortingFilter.DEADLINE, SortingFilter.DESC);
  }

  public componentWillUnmount() {
    const { studentsListStore } = this.props;

    studentsListStore!.resetFilters();
  }

  public handleChangeAnswerStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const value = e.currentTarget.value;

    this.props.studentsListStore!.setFiltersIsAnswered(
      value === BooleanFilter.FALSE || value === BooleanFilter.TRUE ? value : null
    );
  }

  public handleChangeEvaluationStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const value = e.currentTarget.value;

    this.props.studentsListStore!.setFiltersIsEvaluated(
      value === BooleanFilter.FALSE || value === BooleanFilter.TRUE ? value : null
    );
  }

  public handleChangeSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (lettersNoEn(e.target.value)) {
      this.props.studentsListStore!.setAssignmentsFiltersSearchQuery(
        e.currentTarget.value
      );
    }
  }

  public handleChangeSorting = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();

    const [orderField, order] = e.currentTarget.value.split(' ');
    this.props.studentsListStore!.setAssignmentsFilterSorting(
      orderField,
      order
    );
  }

  public renderSearchField = () => (
    <input
      className="StudentAssignments__search"
      placeholder={intl.get('assignments search.Search for assignments')}
      onChange={this.handleChangeSearchQuery}
      aria-labelledby="renderSearchField"
      aria-required="true"
      aria-invalid="false"
      autoFocus
    />
  )

  public renderAnswerStatus = () => (
    <select
      className="StudentAssignments__select"
      onChange={this.handleChangeAnswerStatus}
    >
      <option>{intl.get('assignments search.Answer status')}</option>
      <option value={BooleanFilter.TRUE}>{intl.get('assignments search.Answered')}</option>
      <option value={BooleanFilter.FALSE}>{intl.get('assignments search.Not answered')}</option>
    </select>
  )

  public renderEvaluationStatus = () => (
    <select
      className="StudentAssignments__select"
      onChange={this.handleChangeEvaluationStatus}
    >
      <option>{intl.get('assignments search.Evaluation status')}</option>
      <option value={BooleanFilter.TRUE}>{intl.get('assignments search.Evaluated')}</option>
      <option value={BooleanFilter.FALSE}>{intl.get('assignments search.Not evaluated')}</option>
    </select>
  )

  public renderSorting = () => (
    <select onChange={this.handleChangeSorting} className="StudentAssignments__select">
      <option value={`${SortingFilter.DEADLINE} ${SortingFilter.DESC}`}>
        {intl.get('assignments search.Sort by deadline')} ({intl.get('assignments search.due_last').toLowerCase()})
      </option>
      <option value={`${SortingFilter.DEADLINE} ${SortingFilter.ASC}`}>
        {intl.get('assignments search.Sort by deadline')} ({intl.get('assignments search.due_first').toLowerCase()})
      </option>
    </select>
  )

  public renderAssignment = (assignment: Assignment, index: number) => {
    const { studentsListStore, history, uiStore } = this.props;
    const locale = studentsListStore!.getCurrentLocale();
    const indesPlus = assignment.answerId;
    const handleClickAssignment = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!assignment.isAnswered) {
        return;
      }
      uiStore!.setCurrentActiveTab('assignment');
      history.push(`/assignments/answers/${assignment.id}?answer=${indesPlus}&?isstudent`);
    };

    return studentsListStore!.assignmentsListState === StoreState.LOADING ? (
      <SkeletonLoader key={index} className="StudentAssignment__skeleton" />
    ) : (
      <div className="StudentAssignments__item">
        <StudentAssignment
          key={assignment.id}
          assignment={assignment}
          onClick={handleClickAssignment}
          locale={locale}
        />
      </div>
    );
  }

  public renderFilterPanel() {
    return (
      <div className="StudentAssignments__filterPanel">
        <label id="renderSearchField" className="hidden">{intl.get('assignments search.Search for assignments')}</label>
        {this.renderSearchField()}
        <div className="StudentAssignments__selectBlock">
          {this.renderAnswerStatus()}
          {this.renderEvaluationStatus()}
          {this.renderSorting()}
        </div>
      </div>
    );
  }

  public onScroll = async () => {
    const { studentsListStore } = this.props;
    if (
      this.ref.current!.scrollTop + this.ref.current!.clientHeight >= this.ref.current!.scrollHeight
    ) {
      await studentsListStore!.setAssignmentsFiltersPage(studentsListStore!.currentAssignmentListPage + 1);
    }
  }

  public render() {
    const {
      studentsListStore
    } = this.props;
    const { currentStudent, assignmentsList, assignmentsListForSkeleton, assignmentsListState } = studentsListStore!;

    return (
      <div className="StudentAssignments">
        <div className="StudentAssignments__header">
          <StudentOverviewHeader
            userName={currentStudent!.name}
            userPhoto={currentStudent!.photo}
            currentTab="assignments"
          />
        </div>

        {this.renderFilterPanel()}

        <div
          className={assignmentsListState === StoreState.LOADING ? 'StudentAssignments__skeletonList' : 'StudentAssignments__list'}
          ref={this.ref}
          onScroll={this.onScroll}
        >
          {(assignmentsListState === StoreState.PENDING ? assignmentsList : assignmentsListForSkeleton).map(this.renderAssignment)}
        </div>
      </div>
    );
  }
}

const StudentAssignmentsComponent = withRouter(StudentAssignments);
export { StudentAssignmentsComponent as StudentAssignments };
