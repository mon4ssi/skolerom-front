import React, { Component, createRef } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import max from 'lodash/max';
import min from 'lodash/min';

import { firstLevel, secondLevel, thirdLevel } from 'utils/constants';
import { CurrentQuestionaryStore } from '../CurrentQuestionaryStore';

import list from 'assets/images/list-placeholder.svg';
import question from 'assets/images/questions.svg';
import level1 from 'assets/images/level-1-blue.svg';
import level2 from 'assets/images/level-2-blue.svg';
import level3 from 'assets/images/level-3-blue.svg';
import user from 'assets/images/user-placeholder.png';

import './AnswerCover.scss';

interface Props {
  currentQuestionaryStore?: CurrentQuestionaryStore;
  switchCover(): void;
}

@inject('currentQuestionaryStore')
@observer
export class AnswerCover extends Component<Props> {
  public ref = createRef<HTMLButtonElement>();
  public refEl = createRef<HTMLDivElement>();

  public async componentDidMount() {
    await this.props.currentQuestionaryStore!.getRelatedArticles();
    if (this.ref.current) {
      this.ref.current!.focus();
      this.refEl.current!.scrollIntoView({ behavior: 'smooth' });
    }
  }
  public getStartButtonTitle = () => {
    const { currentQuestionaryStore } = this.props;

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

  public render() {
    const { switchCover, currentQuestionaryStore } = this.props;
    const assignment = currentQuestionaryStore!.assignment;

    return (
      <div className="AnswerCover">
        {this.renderImage()}
        <div className="AnswerCover__teacherInfo">
          <img src={user} alt="Author" className="AnswerCover__teacherLogo"/>
          <span className="AnswerCover__teacherName">{assignment!.author}</span>
        </div>

        <div className="AnswerCover__assignmentInfo">
          {/*<div className="AnswerCover__infoBlock">*/}
          {/*  <img className="AnswerCover__blockImage" src={clock} alt="clock"/>*/}
          {/*  <span className="AnswerCover__blockText">17 {intl.get('assignment preview.min completion time')}</span>*/}
          {/*</div>*/}
          <div className="AnswerCover__infoBlock">
            <img className="AnswerCover__blockImage" src={question} alt="question"/>
            <span className="AnswerCover__blockText">
              {currentQuestionaryStore!.questions.length} {intl.get('assignment preview.questions')}
            </span>
          </div>
          <div className="AnswerCover__infoBlock">
            <img className="AnswerCover__blockImage" src={this.getLevelIcon()} alt="level"/>
            <span className="AnswerCover__blockText">
              {this.getLevels()}
            </span>
          </div>
        </div>

        <span className="AnswerCover__title">{assignment!.title}</span>
        {assignment!.description && <span className="AnswerCover__description">{assignment!.description}</span>}
        {this.getAnsweredQuestionsCount()}
        <div ref={this.refEl} className="AnswerCover__div_button">
          <button className="AnswerCover__button" onClick={switchCover} ref={this.ref} title={this.getStartButtonTitle()}>
            {this.getStartButtonTitle()}
          </button>
        </div>
      </div>
    );
  }
}
