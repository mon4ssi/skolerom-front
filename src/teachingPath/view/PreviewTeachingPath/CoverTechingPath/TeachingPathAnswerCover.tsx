import React, { Component, createRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { QuestionaryTeachingPathStore } from '../../../questionaryTeachingPath/questionaryTeachingPathStore';

import teachingPathImage from 'assets/images/teaching-path.svg';
import userPlaceholder from 'assets/images/user-placeholder.png';
import clock from 'assets/images/rounded-clock.svg';

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
    // const teachingPathNavigateArray = Array.from(document.getElementsByClassName('teachingPathNavigate') as HTMLCollectionOf<HTMLElement>);
    const breadcrumbeArray = Array.from(document.getElementsByClassName('teachingPathNewBreadCrumbs') as HTMLCollectionOf<HTMLElement>);
    // teachingPathNavigateArray[0].style.display = 'none';
    breadcrumbeArray[0].style.display = 'none';
  }
  public componentWillUnmount() {
    // const teachingPathNavigateArray = Array.from(document.getElementsByClassName('teachingPathNavigate') as HTMLCollectionOf<HTMLElement>);
    const breadcrumbeArray = Array.from(document.getElementsByClassName('teachingPathNewBreadCrumbs') as HTMLCollectionOf<HTMLElement>);
    // teachingPathNavigateArray[0].style.display = 'block';
    breadcrumbeArray[0].style.display = 'flex';
  }

  public changeText = (text: Date) => {
    const textNew = String(text).split(' ')[0];
    return textNew;
  }

  public render() {
    const { questionaryTeachingPathStore, onClickStart } = this.props;
    const currentTeachingPath = questionaryTeachingPathStore!.currentTeachingPath;
    const numberOfSteps = currentTeachingPath && currentTeachingPath.numberOfSteps;
    const background = currentTeachingPath && currentTeachingPath!.backgroundImage;
    const avatarauthor = (currentTeachingPath && currentTeachingPath.authorAvatar) ? currentTeachingPath.authorAvatar : userPlaceholder;
    const authorname = currentTeachingPath && currentTeachingPath.author;
    const newDate = (currentTeachingPath && currentTeachingPath.deadline) ? this.changeText(currentTeachingPath.deadline) : '';
    return (
      <div className={'cover'} style={{ backgroundImage: `url(${background})` }}>
        <div className={'cover__content'}>
          <div className="authorInfo">
            <img src={avatarauthor} />
            <h4>{authorname}</h4>
          </div>
          <div className="metaInfo">
            <div className="metaInfo__steps">
              <img src={teachingPathImage} />
              <p>{numberOfSteps && numberOfSteps.max} {intl.get('teaching path preview.steps')}</p>
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
      </div>
    );
  }
}

export const TeachingPathAnswerCover  = withRouter(TeachingPathAnswerCoverComponent);
