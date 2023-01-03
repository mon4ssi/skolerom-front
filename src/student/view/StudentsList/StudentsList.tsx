import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import debounce from 'lodash/debounce';

import { TabNavigation } from 'components/common/TabNavigation/TabNavigation';
import { Pagination } from 'components/common/Pagination/Pagination';
import { SearchFilter } from 'components/common/SearchFilter/SearchFilter';
import { StudentOverview, STUDENT_TAB, StudentOverviewTabs } from './StudentOverview/StudentOverview';
import { StudentListItem } from './StudentListItem';
import { SkeletonLoader } from 'components/common/SkeletonLoader/SkeletonLoader';
import { Student } from 'user/student/Student';
import { StudentsListStore } from 'student/StudentsListStore';

import { lettersNoEn } from 'utils/lettersNoEn';
import { QueryStringKeys, StoreState } from 'utils/enums';
import * as QueryStringHelper from 'utils/QueryStringHelper';
import { DEBOUNCE_TIME } from 'utils/constants';

import './StudentsList.scss';

interface Props extends RouteComponentProps {
  studentsListStore?: StudentsListStore;
  currentTab: string;
}

const STUDENT_QUERY_STRING = 'student';

@inject('studentsListStore')
@observer
export class StudentsListComponent extends Component<Props> {

  private locationUpdateListener: () => void = debounce(
    () => {
      const { history } = this.props;

      if (history.location.pathname.includes('/students')) {
        this.fetchStudents();
      }
    },
    DEBOUNCE_TIME,
  );

  public tabNavigationLinks = [
    {
      name: 'my_students',
      url: '/students/my'
    },
    // {
    //   name: 'previous_students',
    //   url: '/teacher/students/previous'
    // }
  ];

  private unregisterListener: () => void = () => undefined;

  private fetchStudents() {
    const { filter } = this.props.studentsListStore!;

    filter.page = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.PAGE, 1);
    filter.grade = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE);
    filter.subject = QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT);
    filter.searchQuery = QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH);

    this.props.studentsListStore!.getStudentsList();
  }

  public async componentDidMount() {
    this.fetchStudents();
    await this.props.studentsListStore!.getStudentAdditionalData();
    const studentId = QueryStringHelper.getNumber(this.props.history, STUDENT_QUERY_STRING);
    const student = this.props.studentsListStore!.studentsList.find(student => student.id === studentId);
    if (student) {
      this.props.studentsListStore!.currentStudent = student;
    } else {
      QueryStringHelper.remove(this.props.history, STUDENT_QUERY_STRING, STUDENT_TAB);
    }
    document.addEventListener('keyup', this.handleKeyboardControl);

    this.unregisterListener = this.props.history.listen(this.locationUpdateListener);
  }

  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
    this.unregisterListener();
  }

  public handleKeyboardControl = (event: KeyboardEvent) => {
    const filterButton = Array.from(document.getElementsByClassName('SearchFilter__select') as HTMLCollectionOf<HTMLElement>);
    if ((event.shiftKey && event.key === 'Q') || (event.shiftKey && event.key === 'q')) {
      filterButton[0]!.focus();
    }
    if (event.key === 'Escape') {
      this.closeStudentOverview();
    }
  }

  public onChangePage = ({ selected }: { selected: number }) => {
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, selected + 1);
  }

  public handleChangeGrade = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.GRADE,
      Number(e.currentTarget.value) ? e.currentTarget.value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleChangeSubject = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    QueryStringHelper.set(
      this.props.history,
      QueryStringKeys.SUBJECT,
      Number(e.currentTarget.value) ? e.currentTarget.value : ''
    );
    QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
  }

  public handleInputSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      QueryStringHelper.set(this.props.history, QueryStringKeys.SEARCH, e.currentTarget.value);
      QueryStringHelper.set(this.props.history, QueryStringKeys.PAGE, 1);
    }
  }

  public onStudentClick = (currentStudent: Student) => {
    this.props.studentsListStore!.currentStudent = currentStudent;
    QueryStringHelper.set(this.props.history, STUDENT_QUERY_STRING, currentStudent.id);
    QueryStringHelper.set(this.props.history, STUDENT_TAB, StudentOverviewTabs.ASSIGNMENTS);
  }

  public closeStudentOverview = () => {
    this.props.studentsListStore!.currentStudent = null;
    QueryStringHelper.remove(this.props.history, STUDENT_QUERY_STRING, STUDENT_TAB);
  }

  public renderTabNavigate = () => (
    <TabNavigation
      tabNavigationLinks={this.tabNavigationLinks}
      sourceTranslation="students_list.tabs"
    />
  )

  public renderSearchFilter = () => {
    const {
      gradesList,
      subjectsList,
    } = this.props.studentsListStore!;
    return (
      <SearchFilter
        subject
        grade
        customGradesList={gradesList}
        customSubjectsList={subjectsList}
        placeholder={intl.get('students_list.tabs.search_for_students')}
        // METHODS
        handleChangeSubject={this.handleChangeSubject}
        handleChangeGrade={this.handleChangeGrade}
        handleInputSearchQuery={this.handleInputSearchQuery}
        // VALUES
        subjectFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.SUBJECT)}
        gradeFilterValue={QueryStringHelper.getNumber(this.props.history, QueryStringKeys.GRADE)}
        searchQueryFilterValue={QueryStringHelper.getString(this.props.history, QueryStringKeys.SEARCH)}
      />
    );
  }

  public renderStudents = () => {
    const { studentsListStore, currentTab } = this.props;
    const { studentsList, studentsListForSkeleton, studentsListState } = studentsListStore!;
    return currentTab === 'my' ? (
      (studentsListState === StoreState.PENDING ? studentsList : studentsListForSkeleton).map(student => (
        studentsListState === StoreState.LOADING ? (
          <SkeletonLoader
            className="StudentListItem__skeleton"
          />
        ) : (
          <div key={student.id} className="StudentsList__listItem">
            <StudentListItem
              key={student.id}
              onStudentClick={this.onStudentClick}
              student={student}
            />
          </div>
        )
      ))
    ) : null;
  }

  public renderPagination = () => {
    const { totalPages } = this.props.studentsListStore!;

    return totalPages > 1 && (
      <Pagination
        pageCount={totalPages}
        onChangePage={this.onChangePage}
      />
    );
  }

  public renderStudentOverview = () => {
    const { currentStudent } = this.props.studentsListStore!;
    return currentStudent ? (
      <div className="StudentsList__overview">
        <div className="StudentsList__overviewClickable" onClick={this.closeStudentOverview}/>
        <div className="StudentsList__slideOutPanel">
          <StudentOverview
            closeModal={this.closeStudentOverview}
          />
        </div>
      </div>
    ) : null;
  }

  public render() {
    return (
      <>
        <div className="StudentsList">
          <h1 className="generalTitle">
          {intl.get('students_list.title')}
          </h1>
          {this.renderTabNavigate()}

          {this.renderSearchFilter()}

          <div className="StudentsList__list" id="List" aria-live="polite">
            {this.renderStudents()}
          </div>
          {this.renderPagination()}
        </div>

        {this.renderStudentOverview()}
      </>
    );
  }
}

export const StudentsList = withRouter(StudentsListComponent);
