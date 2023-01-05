import React, { Component, MouseEvent, createRef } from 'react';
import classnames from 'classnames';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { StudentAssignments } from './StudentAssignments/StudentAssignments';
import { StudentTeachingPaths } from './StudentTeachingPaths/StudentTeachingPaths';
import { StudentsListStore } from 'student/StudentsListStore';
import { StudentSettings } from './StudentSettings/StudentSettings';
import * as QueryStringHelper from 'utils/QueryStringHelper';

import userPlaceholderImage from 'assets/images/user-placeholder.png';
import closeImage from 'assets/images/close.svg';

import './StudentOverview.scss';

export enum StudentOverviewTabs {
  TEACHING_PATHS = 'teaching_paths',
  ASSIGNMENTS = 'assignments',
  STATISTICS = 'statistics',
  STUDENT_SETTINGS = 'settings'
}

interface Props {
  closeModal: () => void;
  studentsListStore?: StudentsListStore;
}

interface State {
  currentTab: StudentOverviewTabs;
}

export const STUDENT_TAB = 'student_tab';

@inject('studentsListStore')
@observer
class StudentOverview extends Component<Props & RouteComponentProps, State> {
  private reflink = createRef<HTMLAnchorElement>();
  public state = {
    currentTab: StudentOverviewTabs.ASSIGNMENTS,
  };

  public componentDidMount() {
    const currentTab = QueryStringHelper.getString(this.props.history, STUDENT_TAB) as StudentOverviewTabs;

    switch (currentTab) {
      case StudentOverviewTabs.ASSIGNMENTS:
      case StudentOverviewTabs.TEACHING_PATHS:
      case StudentOverviewTabs.STUDENT_SETTINGS:
        this.setState({
          currentTab,
        });
        break;

      default:
        this.setState({
          currentTab: StudentOverviewTabs.ASSIGNMENTS,
        });
        QueryStringHelper.set(this.props.history, STUDENT_TAB, StudentOverviewTabs.ASSIGNMENTS);
    }
    if (this.reflink.current) {
      this.reflink.current.focus();
    }
  }

  public componentWillUnmount() {
    this.props.studentsListStore!.clearAssignmentsList();
  }

  public goToTeachingPaths = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.setState({ currentTab: StudentOverviewTabs.TEACHING_PATHS });
    QueryStringHelper.set(this.props.history, STUDENT_TAB, StudentOverviewTabs.TEACHING_PATHS);
  }

  public goToAssignments = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.setState({ currentTab: StudentOverviewTabs.ASSIGNMENTS });
    QueryStringHelper.set(this.props.history, STUDENT_TAB, StudentOverviewTabs.ASSIGNMENTS);
  }

  // public goToStatistics = (event: MouseEvent<HTMLDivElement>) => {
  //   event.preventDefault();
  //   this.setState({ currentTab: StudentOverviewTabs.STATISTICS });
  // }

  public goToStudentSettings = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.setState({ currentTab: StudentOverviewTabs.STUDENT_SETTINGS });
    QueryStringHelper.set(this.props.history, STUDENT_TAB, StudentOverviewTabs.STUDENT_SETTINGS);
  }

  public renderHeader = () => {
    const { currentTab } = this.state;

    const assignmentsClassnames = classnames('StudentOverview__tab', {
      StudentOverview__tab_selected: currentTab === StudentOverviewTabs.ASSIGNMENTS,
    });

    const teachingPathClassnames = classnames('StudentOverview__tab', {
      StudentOverview__tab_selected: currentTab === StudentOverviewTabs.TEACHING_PATHS,
    });

    const studentSettingsClassname = classnames('StudentOverview__tab', {
      StudentOverview__tab_selected: currentTab === StudentOverviewTabs.STUDENT_SETTINGS,
    });

    return (
      <div className="StudentOverview__header">
        <div className="StudentOverview__headerBlock">
          {/* tslint:disable-next-line:max-line-length */}
          {/*<a className="StudentOverview__tab" href="#" aria-disabled={true}>{intl.get('students_list.students_overview.tabs.teaching_paths')}</a>*/}
          <a
            className={assignmentsClassnames}
            href="#"
            onClick={this.goToAssignments}
            aria-disabled={currentTab === StudentOverviewTabs.ASSIGNMENTS}
            ref={this.reflink}
          >
            {intl.get('students_list.students_overview.tabs.assignments')}
          </a>
          <a
            className={teachingPathClassnames}
            href="#"
            onClick={this.goToTeachingPaths}
            aria-disabled={currentTab === StudentOverviewTabs.TEACHING_PATHS}
          >
            {intl.get('students_list.students_overview.tabs.teaching_paths')}
          </a>
          {/*<a className="StudentOverview__tab" href="#" aria-disabled={true}>{intl.get('students_list.students_overview.tabs.statistics')}</a>*/}
        </div>

        <a
          className={studentSettingsClassname}
          href="#"
          onClick={this.goToStudentSettings}
          aria-disabled={currentTab === StudentOverviewTabs.STUDENT_SETTINGS}
        >
          {intl.get('students_list.students_overview.tabs.student_settings')}
        </a>
      </div>
    );
  }

  public renderTab = () => {
    const { currentTab } = this.state;

    switch (currentTab) {
      case (StudentOverviewTabs.ASSIGNMENTS):
        return <StudentAssignments />;
      case (StudentOverviewTabs.TEACHING_PATHS):
        return <StudentTeachingPaths />;
      case (StudentOverviewTabs.STUDENT_SETTINGS):
        return <StudentSettings />;
      default:
        return;
    }
  }

  public renderUserPanel = () => {
    const { currentStudent } = this.props.studentsListStore!;
    return (
      <div className="StudentOverview__userPanel">
        <img className="StudentOverview__userImage" src={currentStudent!.photo || userPlaceholderImage} alt="student_photo" />
        <div className="StudentOverview__userName">{currentStudent!.name}</div>
        <button className="StudentOverview__closeButton" onClick={this.props.closeModal} title="Close">
          <img src={closeImage} alt="close" title="Close" className="StudentOverview__closeButtonImage"/>
        </button>
      </div>
    );
  }

  public render() {
    return (
        <div className="StudentOverview">
          {this.renderUserPanel()}
          {this.renderHeader()}

          <div className="StudentOverview__content">
            {this.renderTab()}
          </div>
        </div>
    );
  }
}

const StudentOverviewComponent = withRouter(StudentOverview);
export { StudentOverviewComponent as StudentOverview };
