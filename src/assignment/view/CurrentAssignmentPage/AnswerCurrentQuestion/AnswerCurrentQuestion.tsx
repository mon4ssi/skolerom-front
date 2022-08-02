import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import intl from 'react-intl-universal';
import { Location } from 'history';

import './AnswerCurrentQuestion.scss';
import { Answer } from 'assignment/questionary/Questionary';
import { Submit } from '../Submit/Submit';
import { QuestionPreview } from 'components/common/QuestionPreview/QuestionPreview';
import { CurrentQuestionaryStore } from '../CurrentQuestionaryStore';
import { AnswerCover } from '../AnswerCover/AnswerCover';
import { AssignmentArticlesToReading } from '../AssignmentArticlesToReading/AssignmentArticlesToReading';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { LocationState } from '../CurrentAssignmentPage';
import { QuestionaryTeachingPathStore } from 'teachingPath/questionaryTeachingPath/questionaryTeachingPathStore';

interface Props extends RouteComponentProps {
  currentQuestionaryStore?: CurrentQuestionaryStore;
  questionaryTeachingPathStore?: QuestionaryTeachingPathStore;
  isPreview?: boolean;
  answer: Answer;
  numberOfQuestions: number;
  numberOfAnsweredQuestions: number;
  publishQuestionary: () => Promise<void>;
  readOnly: boolean;
  switchCover: () => void;
  showCover: boolean;
  isTeachingPath?: boolean;
  location: Location<LocationState>;
  isIdTeachingPath?: number;
  finishPreviewSubmit?: () => void;
}

@inject('currentQuestionaryStore', 'questionaryTeachingPathStore')
@observer
class AnswerCurrentQuestion extends Component<Props> {

  private revertQuestionary = async () => {
    const { currentQuestionaryStore, questionaryTeachingPathStore, history, isTeachingPath, location: { state } } = this.props;

    const revertQuestionary = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('notifications.are_you_sure'),
      submitButtonTitle: intl.get('notifications.revert')
    });

    if (revertQuestionary) {
      await currentQuestionaryStore!.revertQuestionary();

      if (isTeachingPath && state && state.node && state.teachingPath && questionaryTeachingPathStore!.currentNode) {
        history.push(`/teaching-path/${state.teachingPath}`, {
          node: questionaryTeachingPathStore!.currentNode.id
        });
      } else {
        history.go(0);
      }
    }
  }

  private deleteQuestionary = async () => {
    const { currentQuestionaryStore, questionaryTeachingPathStore, history, isTeachingPath, location: { state } } = this.props;

    const deleteQuestionary = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('notifications.are_you_sure'),
      submitButtonTitle: intl.get('notifications.delete')
    });

    if (deleteQuestionary) {
      await currentQuestionaryStore!.deleteQuestionary();

      if (isTeachingPath && state && state.node && state.teachingPath && questionaryTeachingPathStore!.currentNode) {
        history.push(`/teaching-path/${state.teachingPath}`, {
          node: questionaryTeachingPathStore!.currentNode.id
        });
      } else {
        history.push('/assignments');
      }
    }
  }

  public renderQuestionPreview = () => {
    const {
      answer,
      readOnly,
      numberOfQuestions,
      numberOfAnsweredQuestions,
      publishQuestionary,
      finishPreviewSubmit,
      currentQuestionaryStore,
      isPreview,
      isIdTeachingPath,
      isTeachingPath,
      questionaryTeachingPathStore,
      location: { state }
    } = this.props;

    if (!readOnly && this.props.showCover) {
      const coverInside = (isTeachingPath && state && state.node && state.teachingPath && questionaryTeachingPathStore!.currentNode) ? true : false;
      return (
        <AnswerCover switchCover={this.props.switchCover} isdontTeaching={coverInside}/>
      );
    }
    const redirectData = (currentQuestionaryStore!.currentQuestionary && currentQuestionaryStore!.currentQuestionary.redirectData)
      ? currentQuestionaryStore!.currentQuestionary.redirectData
      : undefined;
    if (currentQuestionaryStore!.assignment && currentQuestionaryStore!.assignment!.relatedArticles.length > 0
      && !currentQuestionaryStore!.assignment!.relatedArticles[0].isHidden && currentQuestionaryStore!.currentQuestionIndex < 0 && redirectData === undefined) {
      return <AssignmentArticlesToReading readOnly={readOnly} />;
    }

    if (redirectData !== undefined && currentQuestionaryStore!.currentQuestionIndex < 0) {
      currentQuestionaryStore!.setCurrentQuestion(0);
    }
    return answer ? (
      <QuestionPreview
        isStudentView
        question={answer.key}
        answer={answer}
        redirectData={redirectData}
        readOnly={readOnly}
        handleShowArrowsTooltip={currentQuestionaryStore!.handleShowArrowsTooltip}
        isPreview={isPreview}
      />
    ) :  (
      <Submit
        numberOfQuestions={numberOfQuestions}
        numberOfAnsweredQuestions={numberOfAnsweredQuestions}
        publishQuestionary={publishQuestionary}
        finishPreviewSubmit={finishPreviewSubmit}
        redirectData={redirectData}
        deleteQuestionary={this.deleteQuestionary}
        revertQuestionary={this.revertQuestionary}
        readOnly={readOnly}
        isPreview={isPreview}
        isIdTeachingPath={isIdTeachingPath}
      />
    );
  }

  public render() {
    return (
      <div className="AnswerCurrentQuestion">
        {this.renderQuestionPreview()}
      </div>
    );
  }
}

const AnswerCurrentQuestionWithRouter = withRouter(AnswerCurrentQuestion);
export { AnswerCurrentQuestionWithRouter as AnswerCurrentQuestion };
