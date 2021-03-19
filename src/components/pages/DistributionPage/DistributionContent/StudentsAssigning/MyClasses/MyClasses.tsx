import React, { Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import classnames from 'classnames';

import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { DistributionGroup } from 'distribution/Distribution';

import { StudentsList } from '../StudentsList/StudentsList';
import { CustomCalendar } from '../CustomCalendar/CustomCalendar';

import { getYearMonthDayDate, formatDeadline } from 'utils/dateFormatter';

import clockImg from 'assets/images/rounded-clock.svg';
import arrowUpImg from 'assets/images/arrow-up-circle.svg';
import arrowDownImg from 'assets/images/arrow-down-circle.svg';
import checkImg from 'assets/images/check-rounded-white-bg.svg';
import checkActiveImg from 'assets/images/check-active.svg';
import checkIntermidiateImg from 'assets/images/check-intermidiate.svg';
import greyClockImg from 'assets/images/rounded-clock-grey.svg';

import './MyClasses.scss';

interface MyClassProps {
  store?: NewAssignmentStore | EditTeachingPathStore;
  myClass: DistributionGroup;
  defaultDeadline: Date;
  readOnly?: boolean;
  index: number;
}

interface MyClassState {
  isStudentsListOpened: boolean;
  isCalendarOpened: boolean;
}

@observer
class MyClass extends Component<MyClassProps, MyClassState> {

  public state = {
    isStudentsListOpened: false,
    isCalendarOpened: false,
  };

  public toggleOpenStudentsList = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    this.setState({ isStudentsListOpened: !this.state.isStudentsListOpened });
  }

  public renderStudentsList = () => {
    const { store, myClass, defaultDeadline, index, readOnly } = this.props;
    const { isStudentsListOpened } = this.state;

    const studentsList = readOnly
      ? store!.filteredStudentsWithoutFilters[index]
      : store!.filteredStudents[index];

    return isStudentsListOpened && (
      <StudentsList
        store={store}
        readOnly={this.props.readOnly}
        students={studentsList}
        classDeadline={myClass.endDate || defaultDeadline}
        myClass={myClass}
      />
    );
  }

  public toggleOpenCalendar = (event: React.MouseEvent) => {
    if (this.props.readOnly) {
      event.stopPropagation();
    } else {
      event.preventDefault();
      this.setState({ isCalendarOpened: !this.state.isCalendarOpened });
    }
  }

  public onDateChange = (date: Date) => {
    const { myClass } = this.props;

    myClass.setEndDate(getYearMonthDayDate(date));
    this.setState({ isCalendarOpened: false });
  }

  public renderCalendar = () => {
    const { myClass, defaultDeadline, store } = this.props;
    const currentLocale = store!.getCurrentLocale();

    return (
      <CustomCalendar
        currentLocale={currentLocale}
        endDate={myClass.endDate || defaultDeadline}
        onChange={this.onDateChange}
        handleClickOutside={this.toggleOpenCalendar}
      />
    );
  }

  public renderDeadline = () => {
    const { myClass, defaultDeadline, readOnly } = this.props;
    const { isCalendarOpened } = this.state;

    const deadLineClassname = classnames('deadline flexBox fs15', {
      endDateFromOutside: !myClass.endDate,
      disabled: readOnly,
    });

    return (
      <div className={deadLineClassname} onClick={this.toggleOpenCalendar}>
        {formatDeadline(myClass.endDate || defaultDeadline)}
        <img src={myClass.endDate ? clockImg : greyClockImg} alt="deadline"/>
        {isCalendarOpened && this.renderCalendar()}
      </div>
    );
  }

  public renderCheck = () => {
    const { myClass } = this.props;
    const isSelectedIcon = myClass.isSelectedAll ? checkActiveImg :
    myClass.isSelected ? checkIntermidiateImg : checkImg;

    return (
      <div className="check flexBox alignCenter">
        <img
          onClick={this.handleSelectFullClass}
          src={isSelectedIcon}
          alt="check"
        />
      </div>
    );
  }

  public handleSelectFullClass = (event: React.SyntheticEvent) => {
    const { store, myClass, readOnly } = this.props;

    const allStudents = myClass.assignedStudents;
    const filteredStudents = store!.filteredStudents[this.props.index];

    const selectedAllStudents = allStudents.filter(student => student.isSelected);

    if (readOnly) {
      event.stopPropagation();
    } else {
      event.preventDefault();

      if (filteredStudents.length === allStudents.length) {
        myClass.setIsSelectedAll(!myClass.isSelectedAll);
        allStudents.forEach(
          student => student.setIsSelected(myClass.isSelectedAll)
        );

      } else {
        selectedAllStudents.length === filteredStudents.length
        ? myClass.setIsSelectedAll(false)
        :  myClass.setIsSelectedAll(true);

        selectedAllStudents.length !== filteredStudents.length ?
          filteredStudents.forEach(
            student => student.setIsSelected(true)
          ) :
          filteredStudents.forEach(
            student => student.setIsSelected(false)
          );
      }

      allStudents.filter(student => student.isSelected).length ?
        myClass.setIsSelected(true) :
        myClass.setIsSelected(false);
    }
  }

  public render() {
    const { myClass, readOnly } = this.props;

    const { isStudentsListOpened } = this.state;

    const numberOfSelectedStudentsText =
      myClass.isSelected && !myClass.isSelectedAll ?
      `${myClass.numberOfSelectedStudents} ${intl.get('distribution_page.of')} ${myClass.numberOfStudents}` :
      myClass.numberOfStudents;

    return (
      <div className="myClassContainer flexBox dirColumn">
        <div className="myClassInfo flexBox spaceBetween">

          <div className="title fw500">
            {myClass.name}
          </div>

          <div className="flexBox justifyEnd alignCenter">
            <div className="studentsNumber fs15">
              {numberOfSelectedStudentsText} {intl.get('distribution_page.students')}
            </div>

            {myClass.isSelected && this.renderDeadline()}

            <div
              className="includeExclude flexBox"
              onClick={this.toggleOpenStudentsList}
            >
              <img
                src={isStudentsListOpened ? arrowUpImg : arrowDownImg}
                alt="arrow-up"
              />
            </div>

            {!readOnly && this.renderCheck()}
          </div>

        </div>

        {this.renderStudentsList()}
      </div>
    );
  }
}

interface Props {
  store?: NewAssignmentStore | EditTeachingPathStore;
  readOnly?: boolean;
}
@observer
export class MyClasses extends Component<Props> {

  public renderClass = (myClass: DistributionGroup, index: number) => {
    const { readOnly, store } = this.props;

    if (readOnly) {
      return (
        <MyClass
          store={store}
          index={index}
          readOnly={true}
          key={`${myClass.name} ${index}`}
          myClass={myClass}
          defaultDeadline={this.props.store!.currentDistribution!.endDate}
        />
      );
    }
    return (this.props.store!.filteredStudents[index].length ? (
      <MyClass
        store={store}
        index={index}
        readOnly={false}
        key={`${myClass.name} ${index}`}
        myClass={myClass}
        defaultDeadline={this.props.store!.currentDistribution!.endDate}
      />
    ) : null
    );
  }

  public renderClasses = (classes: Array<DistributionGroup>) => (
    <div className="classesContainer">
      {classes.map(this.renderClass)}
    </div>
  )

  public render() {
    const { store, readOnly } = this.props;
    const { filteredGroups, selectedGroups } = store!;

    return (
      <div className="MyClasses flexBox dirColumn">

        {this.renderClasses(readOnly ? selectedGroups : filteredGroups)}

      </div>
    );
  }
}
