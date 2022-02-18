import React, { Component, createRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';
import { EditTeachingPathStore } from '../../EditTeachingPath/EditTeachingPathStore';
import teachingPath from 'assets/images/teaching-path.svg';
import userPlaceholder from 'assets/images/user-placeholder.png';

import './TeachingPathAnswerCover.scss';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

interface Props extends RouteComponentProps{
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  content? : DraftTeachingPath;
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
    const { questionaryTeachingPathStore, onClickStart, content } = this.props;
    const currentTeachingPath = questionaryTeachingPathStore!.currentTeachingPath;
    const numberOfSteps = content && content.numberOfSteps;
    return (
      <div className={'cover'}>
         <div className="assignmentInfo">
          {/*<div className={'extraInfo'}>*/}
          {/*  <img src={clock} alt="question"/>*/}
          {/*  <span>17 {intl.get('assignment preview.min completion time')}</span>*/}
          {/*</div>*/}
         </div>

        <span className="assignmentTitle">{content && content.title}</span>
        <span className="assignmentDescription">{content && content.description}</span>

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
