import React, { Component, createRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';

import teachingPath from 'assets/images/teaching-path.svg';
import userPlaceholder from 'assets/images/user-placeholder.png';

import './TeachingPathAnswerCover.scss';

interface Props extends RouteComponentProps{
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  onClickStart(): void;
}

@inject('questionaryTeachingPathStore')
@observer
class TeachingPathAnswerCoverComponent extends Component<Props>{
  public ref = createRef<HTMLButtonElement>();
  public async componentDidMount() {
    this.ref.current!.focus();
  }

  public render() {
    const { questionaryTeachingPathStore, onClickStart } = this.props;
    const currentTeachingPath = questionaryTeachingPathStore!.currentTeachingPath;
    const numberOfSteps = currentTeachingPath && currentTeachingPath.numberOfSteps;
    return (
      <div className={'cover'}>
        <div className={'infoTeacher'}>
          <img src={userPlaceholder} alt=""/>
          <span>{currentTeachingPath && currentTeachingPath.author}</span>
          {/* <span className={'subject'}>6A/History</span> */}
        </div>

         <div className="assignmentInfo">
          {/*<div className={'extraInfo'}>*/}
          {/*  <img src={clock} alt="question"/>*/}
          {/*  <span>17 {intl.get('assignment preview.min completion time')}</span>*/}
          {/*</div>*/}
           <div className={'extraInfo'}>
             <img src={teachingPath} alt="teachingPath"/>
             <span>{numberOfSteps && numberOfSteps.min}-{numberOfSteps && numberOfSteps.max} {intl.get('teaching path preview.steps')}</span>
           </div>
         </div>

        <span className="assignmentTitle">{currentTeachingPath && currentTeachingPath.title}</span>
        <span className="assignmentDescription">{currentTeachingPath && currentTeachingPath.description}</span>

        <div className={'startButton'} >
          <button className="CreateButton" onClick={onClickStart} ref={this.ref} title={intl.get('teaching path preview.Start teaching path')}>
          {intl.get('teaching path preview.Start teaching path')}
          </button>
          {/*<CreateButton onClick={onClickStart} >{intl.get('teaching path preview.Start teaching path')}</CreateButton>*/}
        </div>
      </div>
    );
  }
}

export const TeachingPathAnswerCover  = withRouter(TeachingPathAnswerCoverComponent);
