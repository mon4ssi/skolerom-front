import React, { Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import classnames from 'classnames';

import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { DistributionStudent, DistributionGroup } from 'distribution/Distribution';
import { CustomCalendar } from '../CustomCalendar/CustomCalendar';

import { formatDeadline, getYearMonthDayDate } from 'utils/dateFormatter';
import { firstLevel, secondLevel } from 'utils/constants';

import checkImg from 'assets/images/check-rounded-white-bg.svg';
import checkActiveImg from 'assets/images/check-active.svg';
import clockImg from 'assets/images/rounded-clock.svg';
import greyClockImg from 'assets/images/rounded-clock-grey.svg';
import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';
import thirdLevelImg from 'assets/images/level-3-blue.svg';

import './StudentsList.scss';

interface StudentProps {
  store?: NewAssignmentStore | EditTeachingPathStore;
  student: DistributionStudent;
  classDeadline: Date;
  myClass: DistributionGroup;
  readOnly?: boolean;
}

interface StudentState {
  isCalendarOpened: boolean;
}

@observer
class Student extends Component<StudentProps, StudentState> {

  public state = {
    isCalendarOpened: false,
  };

  public toggleOpenCalendar = (event: React.MouseEvent) => {
    if (this.props.readOnly) {
      event.stopPropagation();
    } else {
      event.preventDefault();
      this.setState({ isCalendarOpened: !this.state.isCalendarOpened });
    }
  }

  public onDateChange = (date: Date) => {
    const { student } = this.props;

    student.setEndDate(getYearMonthDayDate(date));
    this.setState({ isCalendarOpened: false });
  }

  public handleSelectStudent = (event: React.SyntheticEvent) => {
    const { student, myClass, readOnly } = this.props;
    if (readOnly) {
      event.stopPropagation();
    } else {
      event.preventDefault();
      student.setIsSelected(!student.isSelected);
      if (myClass.numberOfSelectedStudents) {
        myClass.setIsSelected(true);
        if (myClass.numberOfSelectedStudents === myClass.numberOfStudents) {
          myClass.setIsSelectedAll(true);
        } else {
          myClass.setIsSelectedAll(false);
        }
      } else {
        myClass.setIsSelected(false);
      }
    }
  }

  public renderCalendar = () => {
    const { student, classDeadline, store } = this.props;
    const currentLocale = store!.getCurrentLocale();

    return (
      <CustomCalendar
        currentLocale={currentLocale}
        endDate={student.endDate || classDeadline}
        onChange={this.onDateChange}
        handleClickOutside={this.toggleOpenCalendar}
      />
    );
  }

  public renderDeadline = () => {
    const { student, readOnly } = this.props;
    const { isCalendarOpened } = this.state;
    const deadLineClassname = classnames('deadline flexBox justifyEnd alignCenter', {
      endDateFromOutside: !student.endDate,
      disabled: readOnly,
    });

    return (
      <div className={deadLineClassname} onClick={this.toggleOpenCalendar}>
        {(student.isSelected || readOnly) && formatDeadline(student.endDate || this.props.classDeadline)}
        <img src={student.endDate ? clockImg : greyClockImg} alt="deadline"/>
        {isCalendarOpened && this.renderCalendar()}
      </div>
    );
  }

  public renderCheck = () => {
    const { student } = this.props;
    return (
      <div className="includeExclude">
        <img
          src={student.isSelected ? checkActiveImg : checkImg}
          alt="check"
          onClick={this.handleSelectStudent}
        />
      </div>
    );
  }

  public renderLevel = () => {
    const { student, readOnly } = this.props;
    const levelImg = student.level.graduation === firstLevel ? firstLevelImg :
      student.level.graduation === secondLevel ? secondLevelImg :
      thirdLevelImg;

    const classNames = classnames(
      'level flexBox',
      readOnly && !student.isSelected && 'disabled'
    );

    return (
      <div className={classNames}>
        <img
          src={levelImg}
          alt="level"
        />
        {student.level.graduation}
      </div>
    );
  }

  public render() {
    const { student, readOnly } = this.props;

    return (
      <div key={`key-${student.name}`} className="student flexBox">

        <div className="flexBox alignCenter">
          {this.renderLevel()}
          <div className="name">
            {readOnly && !student.isSelected ? <span>{student.name}</span> : student.name}
          </div>
        </div>

        <div className="flexBox justifyEnd alignCenter">

          {(readOnly || student.isSelected) && this.renderDeadline()}

          {!readOnly && this.renderCheck()}
        </div>

      </div>
    );
  }
}

interface Props {
  store?: NewAssignmentStore | EditTeachingPathStore;
  students: Array<DistributionStudent>;
  classDeadline: Date;
  myClass: DistributionGroup;
  readOnly?: boolean;
}

export class StudentsList extends Component<Props> {

  public renderStudent = (student: DistributionStudent) => (
    <Student
      key={`${student.id}`}
      store={this.props.store}
      readOnly={this.props.readOnly}
      student={student}
      classDeadline={this.props.classDeadline}
      myClass={this.props.myClass}
    />
  )

  public render() {
    const { students, readOnly } = this.props;
    const listHeaderStyle = classnames(
      'listHeader flexBox spaceBetween',
      readOnly && 'whiteBackground',
    );
    const studentsListContainerStyle = classnames(
      'studentsListContainer',
      readOnly && 'whiteBackground',
    );

    return (
      <div className="studentsList flexBox dirColumn myClassesBorder">
        <div className={listHeaderStyle}>
          <div className="flexBox">
            <div className="level">
              {intl.get('distribution_page.level')}
            </div>
            <div className="name">
              {intl.get('distribution_page.name')}
            </div>

          </div>
          <div className="includeExclude">
            {intl.get(`distribution_page.${readOnly ? 'due_date' : 'include_exclude'}`)}
          </div>
        </div>
        <div className={studentsListContainerStyle}>
          {students.map(this.renderStudent)}
        </div>
      </div>
    );
  }
}
