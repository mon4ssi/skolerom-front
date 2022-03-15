import React, { Component } from 'react';
import classnames from 'classnames';
import intl from 'react-intl-universal';

import './AssignmentOverview.scss';
import { Answer } from 'assignment/questionary/Questionary';

const coverWithArticleCardsIndex = 2;

interface Props {
  answers: Array<Answer>;
  currentQuestion: number;
  questionsList: Array<string>;
  setCurrentQuestion: (index: number) => void;
  numberOfAnsweredQuestions: number;
  handleShowArrowsTooltip: (value: boolean) => void;
  readOnly: boolean;
  isShowAssignmentArticles: boolean;
  isStartedAssignment: boolean;
  isReadArticles: boolean;
  redirectData?: number;
  isTeacher?: boolean;
  isPreview?: boolean;
}

export class AssignmentOverview extends Component<Props> {

  public get isStarted() {
    return this.props.isStartedAssignment || this.props.isTeacher;
  }
  public renderQuestion = (questionTitle: string, index: number) => {
    const {
      answers,
      setCurrentQuestion,
      currentQuestion,
      numberOfAnsweredQuestions,
      handleShowArrowsTooltip,
      questionsList,
      isShowAssignmentArticles,
      redirectData,
    } = this.props;

    const currentQuestionAnswerStatus = answers[index] ?
      (!!answers[index].value.length) :
      numberOfAnsweredQuestions === questionsList.length - 1;

    const indexInsideClass = (Number(currentQuestion) === Number(index)) ? 'question_in' : '' ;

    const questionClassname = classnames('AssignmentOverview__question', indexInsideClass, {
      AssignmentOverview__question_answered: currentQuestionAnswerStatus,
      AssignmentOverview__question_disabled: !this.isStarted,
      AssignmentOverview__text: currentQuestion !== index,
    });

    const questionNumberClassname = classnames('AssignmentOverview__order', {
      AssignmentOverview__question_answered: currentQuestionAnswerStatus,
    });

    const questionLinkClassname = classnames(indexInsideClass, {
      AssignmentOverview__questionLink_disabled: !this.isStarted,
    });

    const handleChangeCurrentQuestion = (event: React.SyntheticEvent) => {
      event.preventDefault();
      if (!this.props.isPreview && this.isStarted) {
        handleShowArrowsTooltip(false);
        setCurrentQuestion(index);
      }
    };

    const renderQuestionNumber = () => {
      if (redirectData) {
        return index + 1;
      }
      if (isShowAssignmentArticles) {
        return index + coverWithArticleCardsIndex;
      }
      return index + 1;
    };

    return (
      <li key={`question-${index}`} className={questionClassname}>
        <a href="#" className={questionLinkClassname} onClick={handleChangeCurrentQuestion}>
          <div className={questionNumberClassname}>
            {renderQuestionNumber()}
          </div>
          {questionTitle}
        </a>
      </li>
    );
  }

  public renderAssignmentArticles = () => {
    const {
      isShowAssignmentArticles,
      setCurrentQuestion,
      handleShowArrowsTooltip,
      isReadArticles
    } = this.props;

    const handleChangeCurrentQuestion = (event: React.SyntheticEvent) => {
      event.preventDefault();
      if (!this.props.isPreview && this.isStarted) {
        handleShowArrowsTooltip(false);
        setCurrentQuestion(-1);
      }
    };

    const questionClassname = classnames('AssignmentOverview__question AssignmentOverview__text', {
      AssignmentOverview__question_answered: isReadArticles,
      AssignmentOverview__question_disabled: !this.isStarted,
    });

    const questionNumberClassname = classnames('AssignmentOverview__order', {
      AssignmentOverview__question_answered: isReadArticles,
    });

    const questionLinkClassname = classnames({
      AssignmentOverview__questionLink_disabled: !this.isStarted,
    });

    return isShowAssignmentArticles && (
      <li key={`question-${-1}`} className={questionClassname}>
        <a href="#" className={questionLinkClassname} onClick={handleChangeCurrentQuestion}>
          <div className={questionNumberClassname}>
            1
          </div>
          {intl.get('assignment preview.Assignment articles')}
        </a>
      </li>
    );
  }

  public renderQuestions = () => (
    this.props.questionsList.map(this.renderQuestion)
  )

  public render() {
    const { redirectData } = this.props;
    return (
      <div className="AssignmentOverview">
        <div className="AssignmentOverview__header AssignmentOverview__text">
          {intl.get('current_assignment_page.Assignment overview')}
        </div>
        <ul className="AssignmentOverview__questions">
          {!redirectData && this.renderAssignmentArticles()}
          {this.renderQuestions()}
        </ul>
      </div>
    );
  }
}
