import React, { ChangeEvent, Component } from 'react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { StudentOverviewHeader } from '../StudentOverviewHeader/StudentOverviewHeader';
import { StudentsListStore } from 'student/StudentsListStore';
import { StudentAssignment } from './StudentTeachingPath';
import { Assignment } from 'assignment/Assignment';
import { InfoCard } from 'components/common/InfoCard/InfoCard';

import { lettersNoEn } from 'utils/lettersNoEn';
import { BooleanFilter, SortingFilter, StoreState } from 'utils/enums';

import './StudentTeachingPaths.scss';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { UIStore } from 'locales/UIStore';
import { TeachingPath } from 'teachingPath/TeachingPath';
import teachingPathIcon from 'assets/images/teaching-path.svg';
import listPlaceholderImg from 'assets/images/list-placeholder.svg';

interface Props extends RouteComponentProps {
  studentsListStore?: StudentsListStore;
  uiStore?: UIStore;
}

@inject('studentsListStore', 'uiStore')
@observer
class StudentTeachingPaths extends Component<Props> {
  public ref = React.createRef<HTMLDivElement>();

  public async componentDidMount() {
    const { studentsListStore } = this.props;

    studentsListStore!.setTeachingPathFilterSorting(SortingFilter.DEADLINE, SortingFilter.DESC);
  }

  public componentWillUnmount() {
    const { studentsListStore } = this.props;

    studentsListStore!.resetFiltersTp();
  }

  public handleChangeAnswerStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const value = e.currentTarget.value;

    this.props.studentsListStore!.setFiltersIsAnsweredTP(
      value === BooleanFilter.FALSE || value === BooleanFilter.TRUE ? value : null
    );
  }

  public handleChangeSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (lettersNoEn(e.target.value)) {
      this.props.studentsListStore!.setTeachingPathFiltersSearchQuery(
        e.currentTarget.value
      );
    }
  }

  public handleChangeSorting = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();

    const [orderField, order] = e.currentTarget.value.split(' ');
    this.props.studentsListStore!.setTeachingPathFilterSorting(
      orderField,
      order
    );
  }

  public renderSearchField = () => (
    <input
      className="StudentAssignments__search"
      placeholder={intl.get('teaching path search.Search for teaching paths')}
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

  public onClickTeachingPath = (id: number, view: string) => {
    const { history } = this.props;
    history.push(`/teaching-paths/answers/${id}?answer=`);
  }

  public renderTP = (item: TeachingPath, index: number) => {
    const { studentsListStore, history, uiStore } = this.props;
    const locale = studentsListStore!.getCurrentLocale();
    const indesPlus = item.answerId;

    const handleClickTP = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!item.isAnswered) {
        return;
      }
      history.push(`/teaching-paths/answers/${item.id}?answer=${indesPlus}&?isstudent`);
    };

    return studentsListStore!.teachingPathListState === StoreState.LOADING ? (
      <SkeletonLoader key={index} className="StudentAssignment__skeleton" />
    ) : (
      <div className="StudentAssignments__item">
        <StudentAssignment
          key={item.id}
          assignment={item}
          onClick={handleClickTP}
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
    const { currentStudent, teachingpathList, teachingpathListForSkeleton, teachingPathListState } = studentsListStore!;
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
          className={teachingPathListState === StoreState.LOADING ? 'StudentAssignments__skeletonList' : 'StudentAssignments__list'}
          ref={this.ref}
          onScroll={this.onScroll}
        >
          {(teachingPathListState === StoreState.PENDING ? teachingpathList : teachingpathListForSkeleton).map(this.renderTP)}
        </div>
      </div>
    );
  }
}

const StudentTeachingPathsComponent = withRouter(StudentTeachingPaths);
export { StudentTeachingPathsComponent as StudentTeachingPaths };
