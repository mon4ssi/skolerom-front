import React, { Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { EditEntityLocaleKeys } from 'utils/enums';

import defaultUserPhoto from 'assets/images/profile-avatar.png';
import questionImg from 'assets/images/questions.svg';
import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';
import thirdLevelImg from 'assets/images/level-3-blue.svg';

import { secondLevel, thirdLevel } from 'utils/constants';
import { getStudentLevelsRange } from 'utils/studentLevelsRange';

import './Header.scss';

interface Props {
  store?: NewAssignmentStore | EditTeachingPathStore;
}

@observer
export class Header extends Component<Props> {

  public renderQuestionsInfo = () => {
    const { store } = this.props;
    const numberOfQuestions = (store!.currentEntity! as DraftAssignment).questions.length;

    return (
      <div>
        <img src={questionImg} alt="question" />
        {intl.get('publishing_page.number_of_question', { numberOfQuestions, ending: numberOfQuestions !== 1 && 's' })}
      </div>
    );
  }

  public render() {
    const { store } = this.props;
    const { currentEntity } = store!;

    const currentUser = store!.getCurrentUser()!;

    const levelImage = currentEntity!.levels.includes(thirdLevel) ? thirdLevelImg :
    currentEntity!.levels.includes(secondLevel) ? secondLevelImg :
      firstLevelImg;

    return (
      <div className="Header ">

        <div className="withPicture flexBox justifyCenter alignCenter dirColumn">
          {/* <img src={backgroundImg} alt="background" className="headerBackground" /> */}
          <div className="teachingPathTitle">
            {currentEntity!.title}
          </div>

          <div className="teacher flexBox spaceBetween alignCenter">
            <img src={currentUser.photo || defaultUserPhoto} alt="teacher-img" />

            <div className="teacherInfo flexBox dirColumn justifyCenter">
              <div>
                <span className={'fw300'}>{intl.get('publishing_page.teacher')}</span>
                <span className={'fw500'}>{currentUser.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="teachingPathInfo flexBox justifyCenter alignCenter">
          {/*<div>*/}
          {/*  <img src={clockImg} alt="clock" />*/}
          {/*  {intl.get('publishing_page.completion_time', { time: 11 })}*/}
          {/*</div>*/}

          {store!.localeKey === EditEntityLocaleKeys.NEW_ASSIGNMENT && this.renderQuestionsInfo()}

          <div>
            <img src={levelImage} alt="level" />
            {intl.get('publishing_page.level_number', { level: getStudentLevelsRange(currentEntity!.levels) })}
          </div>
        </div>
      </div>
    );
  }
}
