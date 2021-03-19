import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { Student } from 'user/student/Student';

import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';
import thirdLevelImg from 'assets/images/level-3-blue.svg';
import userPlaceholderImage from 'assets/images/user-placeholder.png';

import './StudentListItem.scss';

const firstLevel = 1;
const secondLevel = 2;

interface StudentProps {
  // tslint:disable-next-line: no-any
  student: Student;
  onStudentClick: (student: Student) => void;
}

@observer
export class StudentListItem extends Component<StudentProps> {

  public handleStudentClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.props.onStudentClick(this.props.student);
  }

  public renderPhotoName = () => {
    const { name, photo } = this.props.student;
    return (
      <>
        <img
          src={photo || userPlaceholderImage}
          alt="student"
          className="StudentListItem__avatar"
        />
        <div className="StudentListItem__name">
          {name}
        </div>
      </>
    );
  }

  public renderSubjects = (isMobile: boolean = false) => {
    const { subjects } = this.props.student;

    const subjectsString = subjects
      .map(subject => subject.title)
      .join(', ');

    const subjectClasses = classNames('StudentListItem__subjects', {
      StudentListItem__subjects_mobile: isMobile,
    });

    return (
      <div className={subjectClasses}>
        {subjectsString}
      </div>
    );
  }

  public renderGrade = () => {
    const { grades } = this.props.student;
    return grades.length ? (
      <div className="StudentListItem__grade">
        {grades[0].title}
      </div>
    ) : null;
  }

  public renderLevel = () => {
    const { level } = this.props.student;
    const levelImg = level!.graduation === firstLevel ? firstLevelImg :
      level!.graduation === secondLevel ? secondLevelImg : thirdLevelImg;

    return level ? (
      <div className="StudentListItem__level">
        <img
          src={levelImg}
          alt="level"
          className="StudentListItem__levelImage"
        />
        {level.graduation}
      </div>
    ) : null;
  }

  public render() {
    return (
      <a
        className="StudentListItem"
        href="#"
        onClick={this.handleStudentClick}
      >
        <div className="StudentListItem__block StudentListItem__blockMain">
          {this.renderPhotoName()}
          {this.renderSubjects(true)}
        </div>

        <div className="StudentListItem__block">

          {this.renderSubjects()}
          {this.renderGrade()}
          {this.renderLevel()}
        </div>
      </a>
    );
  }
}
