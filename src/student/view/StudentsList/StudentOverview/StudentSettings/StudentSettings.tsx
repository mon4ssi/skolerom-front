import React, { Component, MouseEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { StudentsListStore } from 'student/StudentsListStore';
import { StudentOverviewHeader } from '../StudentOverviewHeader/StudentOverviewHeader';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import { firstLevel, secondLevel, thirdLevel } from 'utils/constants';

import settingsImg from 'assets/images/settings-slider.svg';
import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';
import thirdLevelImg from 'assets/images/level-3-blue.svg';

import './StudentSettings.scss';

interface Props {
  studentsListStore?: StudentsListStore;
}

interface State {
  currentLevel: number;
}

@inject('studentsListStore')
@observer
export class StudentSettings extends Component<Props, State> {

  public setLevel = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const { studentsListStore } = this.props;

    const value = Number(e.currentTarget.value);

    if (studentsListStore!.currentStudent!.level!.id !== value) {
      const confirm = await Notification.create({
        type: NotificationTypes.CONFIRM,
        title: intl.get('students_list.students_overview.student_settings.confirm_message')
      });

      if (confirm) {
        studentsListStore!.currentStudent!.setLevel(
          studentsListStore!.levelsList.find(level => level.id === value)!
        );
        studentsListStore!.changeStudentLevel(studentsListStore!.currentStudent!.id, value);
      }
    }
  }

  public render() {
    const { currentStudent, levelsList } = this.props.studentsListStore!;

    const firstLevelId = levelsList.find(level => level.graduation === firstLevel)!.id;
    const secondLevelId = levelsList.find(level => level.graduation === secondLevel)!.id;
    const thirdLevelId = levelsList.find(level => level.graduation === thirdLevel)!.id;

    return (
      <div className="StudentSettings">
        <div className="StudentSettings__header">
          <StudentOverviewHeader
            userName={currentStudent!.name}
            userPhoto={currentStudent!.photo}
            currentTab="settings"
          />
        </div>

        <div className="levelIcon">
          <img src={settingsImg} alt="level_icon" />
          {intl.get('students_list.students_overview.student_settings.student_level')}
        </div>

        <div className="levelText">
          {intl.get('students_list.students_overview.student_settings.text_1', { name: currentStudent!.name })}
            <span>{intl.get('students_list.students_overview.student_settings.level')} {currentStudent!.level!.graduation}.</span>
          <br />
          {intl.get('students_list.students_overview.student_settings.text_2')}
        </div>

        <div className="levelButtons flexBox">

          <button
            value={firstLevelId}
            onClick={this.setLevel}
            className={currentStudent!.level!.graduation === firstLevel ? 'active' : undefined}
            title="first-level"
          >
            <img src={firstLevelImg} alt="first-level" />
            <span className={`fw300 ${currentStudent!.level!.graduation === firstLevel ? 'activeNumber' : undefined}`}>1</span>
          </button>

          <button
            value={secondLevelId}
            onClick={this.setLevel}
            className={currentStudent!.level!.graduation === secondLevel ? 'active' : undefined}
            title="second-level"
          >
            <img src={secondLevelImg} alt="second-level" />
            <span className={`fw300 ${currentStudent!.level!.graduation === secondLevel ? 'activeNumber' : undefined}`}>2</span>
          </button>

          <button
            value={thirdLevelId}
            onClick={this.setLevel}
            className={currentStudent!.level!.graduation === thirdLevel ? 'active' : undefined}
            title="third-level"
          >
            <img src={thirdLevelImg} alt="third-level" />
            <span className={`fw300 ${currentStudent!.level!.graduation === thirdLevel ? 'activeNumber' : undefined}`}>3</span>
          </button>

        </div>
      </div>
    );
  }
}
