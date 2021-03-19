import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { TeachingPathEvaluationStore, StudentEvaluationStep } from 'teachingPath/evaluationDraft/TeachingPathEvaluationStore';
import { Loader } from 'components/common/Loader/Loader';
import { RelatedCard } from 'assignment/view/Evaluation/CheckingPanelContent/RelatedCards/RelatedCard';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { QuestionPreview } from 'components/common/QuestionPreview/QuestionPreview';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { EvaluationLabel } from 'components/common/EvaluationLabel/EvaluationLabel';

import exitImg from 'assets/images/exit.svg';

import './StudentEvaluationCheckingPanel.scss';

interface Props extends RouteComponentProps {
  teachingPathEvaluationStore?: TeachingPathEvaluationStore;
}

@inject('teachingPathEvaluationStore')
@observer
class StudentEvaluationCheckingPanel extends Component<Props> {

  public renderArticleType = (step: StudentEvaluationStep) =>
  step.items.map(articleItem => (
      <RelatedCard
        key={articleItem.id}
        type={step.type}
        title={articleItem.title}
        id={articleItem.id}
        level={articleItem.levels[0]}
        image={articleItem.featuredImage}
        isChosen={articleItem.isSelected}
      />
    )
  )

  public renderAssignmentCards = (step: StudentEvaluationStep) => (
    step.items.map((item) => {
      const assignmentItem = item;
      return (
        <RelatedCard
          key={assignmentItem.id}
          type={step.type}
          title={assignmentItem.title}
          id={assignmentItem.id}
          image={assignmentItem.featuredImage}
          level={assignmentItem.levels[0]}
          questionCounter={assignmentItem.numberOfQuestions}
          isChosen={assignmentItem.isSelected}
        />
      );
    })
  )

  public renderQuestions = (step: StudentEvaluationStep) => {
    if (step.assignmentAnswers!.revisionContent && step.assignmentAnswers!.revisionContent.questions
      && step.assignmentAnswers!.revisionContent.questions.length) {
      const questions = step.assignmentAnswers!.revisionContent.questions;
      return questions.map((question) => {
        const answer = step.assignmentAnswers!.revisionContent.answers.find(answer => answer.answerBlock.key.id === question.id);
        const questionComment = step.assignmentAnswers!.revisionContent.answers.find(item => item.answerBlock.key.id === question.id);
        return (
          <QuestionPreview
            readOnly
            isStudentView
            isEvaluationStyle
            withLargeCounter
            key={question.id}
            question={question}
            answer={answer && answer.answerBlock}
            comment={questionComment && questionComment.comment}
          />
        );
      });
    }
  }

  public renderAssignmentType = (step: StudentEvaluationStep) => (
    <>
      {this.renderAssignmentCards(step)}
      <div className={'teachingPathNodeQuestions'}>
        {this.renderQuestions(step)}
      </div>
    </>
  )

  public renderSteps = () => {
    const { teachingPathEvaluationStore } = this.props;

    if (!teachingPathEvaluationStore!.studentEvaluationSteps.length) {
      return (
        <div className="StudentEvaluationPage__leftLoader">
          <Loader />
        </div>
      );
    }

    return teachingPathEvaluationStore!.studentEvaluationSteps.map(
      (step, index: number) => (
        <div className="StudentEvaluationPage_stepInfo" key={step.nodeId}>
          <div className="alignCenter stepCounterWrapper">
            <span className="stepCounter">{index + 1}</span>
            <span className="stepCounterTitle">
              {step.type === 'ASSIGNMENT' ? intl.get('evaluation_page.Choose assignment') : intl.get('evaluation_page.Choose article')}
            </span>
          </div>
          {step.type === TeachingPathNodeType.Assignment ? this.renderAssignmentType(step) : this.renderArticleType(step)}
        </div>
      )
    );
  }

  public handleExit = () => {
    this.props.history.push('/teaching-paths');
  }

  public renderLeftSide = () => {
    const { teachingPathEvaluationStore } = this.props;

    return (
      <div className="StudentEvaluationPage__leftSide">
        <CreateButton className="backButton" onClick={this.handleExit}>
          <div>
            <img src={exitImg} alt="exit"/>
            <span>{intl.get('answers.teaching_path_back')}</span>
          </div>
        </CreateButton>
        <div className="StudentEvaluationPage__evaluation">
          {intl.get('answers.Evaluation')}
        </div>
        <div className="StudentEvaluationPage__teachingPathTitle">
          {teachingPathEvaluationStore!.studentEvaluation!.revisionContent.title}
        </div>
        <div className="StudentEvaluationPage__steps">
          {this.renderSteps()}
        </div>
      </div>
    );
  }

  public renderAssignmentComment = () => {
    const { teachingPathEvaluationStore } = this.props;
    if (teachingPathEvaluationStore!.studentEvaluation) {
      if (teachingPathEvaluationStore!.studentEvaluation!.comment) {
        return (
          teachingPathEvaluationStore!.studentEvaluation!.comment
        );
      }
      return `${teachingPathEvaluationStore!.studentEvaluation!.author} ${intl.get('answers.not comment')}`;
    }
  }

  public renderEvaluationLabel = () => {
    const { teachingPathEvaluationStore } = this.props;

    if (teachingPathEvaluationStore!.studentEvaluation) {
      const { isPassed, mark, status } = teachingPathEvaluationStore!.studentEvaluation;
      return (
        <EvaluationLabel status={status} mark={mark} isPassed={isPassed}/>
      );
    }
  }

  public renderRightSide = () => (
    <div className="StudentEvaluationPage__rightSide flexBox dirColumn">
      <div className="comments">
        <div className="comment">
          <span className={'headline withPadding'}>{intl.get('answers.Comment to student')}</span>
          <span className={'fw300'}>
            {this.renderAssignmentComment()}
          </span>
        </div>
        <div className="evaluation">
          <span className={'headline'}>{intl.get('answers.Evaluation')}</span>
          {this.renderEvaluationLabel()}
        </div>
      </div>
    </div>
  )

  public render() {
    const { teachingPathEvaluationStore } = this.props;

    if (!teachingPathEvaluationStore!.studentEvaluation) {
      return (
        <div className="StudentEvaluationPage__rightLoader">
          <Loader />
        </div>
      );
    }

    return (
      <div className="StudentEvaluationPage__container">
        {this.renderLeftSide()}
        {this.renderRightSide()}
      </div>
    );
  }
}

const StudentEvaluationCheckingPanelWithRouter = withRouter(StudentEvaluationCheckingPanel);
export { StudentEvaluationCheckingPanelWithRouter as StudentEvaluationCheckingPanel };
