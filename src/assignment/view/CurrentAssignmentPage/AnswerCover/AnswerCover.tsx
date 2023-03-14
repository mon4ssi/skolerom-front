import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import max from 'lodash/max';
import min from 'lodash/min';

import { firstLevel, secondLevel, thirdLevel } from 'utils/constants';
import { CurrentQuestionaryStore } from '../CurrentQuestionaryStore';

import list from 'assets/images/list-placeholder.svg';
import teachingPathImage from 'assets/images/teaching-path.svg';
import userPlaceholder from 'assets/images/user-placeholder.png';
import clock from 'assets/images/rounded-clock.svg';
import question from 'assets/images/questions.svg';
import level1 from 'assets/images/level-1-blue.svg';
import level2 from 'assets/images/level-2-blue.svg';
import level3 from 'assets/images/level-3-blue.svg';

import './AnswerCover.scss';
import { UserType } from 'user/User';
const DELAY = 800;
interface Props {
  currentQuestionaryStore?: CurrentQuestionaryStore;
  isdontTeaching?: boolean;
  switchCover(): void;
}

@inject('currentQuestionaryStore')
@observer
export class AnswerCover extends Component<Props> {
  public ref = createRef<HTMLButtonElement>();
  public refEl = createRef<HTMLDivElement>();

  public async componentDidMount() {
    const Navrray = Array.from(document.getElementsByClassName('CurrentAssignmentPage__navBar') as HTMLCollectionOf<HTMLElement>);
    const newContent = Array.from(document.getElementsByClassName('CurrentAssignmentPage__main') as HTMLCollectionOf<HTMLElement>);
    Navrray[0].style.display = 'none';
    newContent[0].classList.remove('questionBody');
    if (this.props.isdontTeaching) {
      const breadcrumbeArray = Array.from(document.getElementsByClassName('CurrentAssignmentPage__mybreadcrumbs') as HTMLCollectionOf<HTMLElement>);
      breadcrumbeArray[0].style.display = 'none';
    }
    if (this.ref.current) {
      this.ref.current!.focus();
      this.refEl.current!.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => { this.refEl.current!.focus(); }, DELAY);
    }
  }

  public componentWillUnmount() {
    const Navrray = Array.from(document.getElementsByClassName('CurrentAssignmentPage__navBar') as HTMLCollectionOf<HTMLElement>);
    const newContent = Array.from(document.getElementsByClassName('CurrentAssignmentPage__main') as HTMLCollectionOf<HTMLElement>);
    Navrray[0].style.display = 'block';
    newContent[0].classList.add('questionBody');
    if (this.props.isdontTeaching) {
      const breadcrumbeArray = Array.from(document.getElementsByClassName('CurrentAssignmentPage__mybreadcrumbs') as HTMLCollectionOf<HTMLElement>);
      breadcrumbeArray[0].style.display = 'flex';
    }
  }

  public getStartButtonTitle = () => {
    const { currentQuestionaryStore } = this.props;
    const currentUserIsNotStudent = currentQuestionaryStore!.getCurrentUser()!.type !== UserType.Student;

    if (currentUserIsNotStudent) {
      return intl.get('assignment preview.Start assignment');
    }

    if (!currentQuestionaryStore!.numberOfAnsweredQuestions) {
      return intl.get('assignment preview.Start assignment');
    }

    if (currentQuestionaryStore!.numberOfAnsweredQuestions === currentQuestionaryStore!.numberOfQuestions) {
      return intl.get('assignment preview.Edit assignment');
    }

    return intl.get('assignment preview.continue_assignment');
  }

  public getLevels(): string {
    // tslint:disable-next-line:no-magic-numbers
    if (this.props.currentQuestionaryStore!.assignment!.levels.length === 3) {
      return '1-3';
    }
    if (this.props.currentQuestionaryStore!.assignment!.levels.length === 1) {
      return `${this.props.currentQuestionaryStore!.assignment!.levels[0]}`;
    }
    // tslint:disable-next-line:no-magic-numbers
    if (this.props.currentQuestionaryStore!.assignment!.levels.length === 2) {
      const maxLevel = max(this.props.currentQuestionaryStore!.assignment!.levels);
      const minLevel = min(this.props.currentQuestionaryStore!.assignment!.levels);

      return `${minLevel}, ${maxLevel}`;
    }
    return '';
  }

  public getLevelIcon() {
    const maxValue = max(this.props.currentQuestionaryStore!.assignment!.levels);
    switch (maxValue) {
      case firstLevel:
        return level1;
      case secondLevel:
        return level2;
      case thirdLevel:
        return level3;
      default:
        throw new Error(`Unknown level ${maxValue}`);
    }
  }

  public getAnsweredQuestionsCount = () => {
    const { currentQuestionaryStore } = this.props;

    let questionCountText = null;
    if (currentQuestionaryStore!.numberOfAnsweredQuestions > 0) {
      questionCountText = (
        <>
          {/* tslint:disable-next-line: jsx-no-multiline-js */}
          {
            intl.get(
              'assignment preview.Questions count',
              {
                answeredQuestionsCount: currentQuestionaryStore!.numberOfAnsweredQuestions,
                totalQuestionsCount: currentQuestionaryStore!.numberOfQuestions
              }
            )
          }
          {' '}
          <span className="AnswerCover__questionCount_light">{intl.get('assignment preview.questions answered')}</span>
        </>
      );
    }

    return (
      <div className="AnswerCover__questionCount">
        {questionCountText}
      </div>
    );
  }

  public renderImage = () => {
    const { currentQuestionaryStore } = this.props;
    const image = currentQuestionaryStore!.featuredImage
      ? <img src={currentQuestionaryStore!.featuredImage} alt="mainImage" className="AnswerCover__image"/>
      : <img src={list} alt="default" className="AnswerCover__image"/>;

    return (
      <div className="AnswerCover__imageWrapper">
        {image}
      </div>
    );
  }

  public changeText = (text: Date) => {
    const textNew = String(text).split(' ')[0];
    return textNew;
  }

  public render() {
    const { switchCover, currentQuestionaryStore } = this.props;
    const assignment = currentQuestionaryStore!.assignment;
    const background = (currentQuestionaryStore && currentQuestionaryStore!.backgroundImage) ? currentQuestionaryStore!.backgroundImage : list;
    const avatarauthor = (currentQuestionaryStore && currentQuestionaryStore.authoravatar) ? currentQuestionaryStore.authoravatar : userPlaceholder;
    const authorname = currentQuestionaryStore && currentQuestionaryStore.author;
    const newDate = (currentQuestionaryStore && currentQuestionaryStore.deadline) ? this.changeText(currentQuestionaryStore.deadline) : '';
    return (
      <div className="AnswerCover" style={{ backgroundImage: `url(${background})` }}>
        <div className="AnswerCover__content">
          <div className="authorInfo">
            <img src={avatarauthor} />
            <h4>{authorname}</h4>
          </div>
          <div className="metaInfo">
            <div className="metaInfo__steps">
              <img src={teachingPathImage} />
              <p>{currentQuestionaryStore && currentQuestionaryStore!.numberOfQuestions} {intl.get('teaching path preview.steps')}</p>
            </div>
          </div>
          <span className="AnswerCover__title">{assignment!.title}</span>
          {assignment!.description && <span className="AnswerCover__description">{assignment!.description}</span>}
          <div ref={this.refEl} className="AnswerCover__div_button">
            <button className="AnswerCover__button" onClick={switchCover} ref={this.ref} title={this.getStartButtonTitle()}>
              {this.getStartButtonTitle()}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
