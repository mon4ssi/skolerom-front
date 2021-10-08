import React, { Component, MouseEvent } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';

import { EvaluationStep, TeachingPathEvaluationStore } from 'teachingPath/evaluationDraft/TeachingPathEvaluationStore';
import { Loader } from 'components/common/Loader/Loader';
import { RelatedCard } from './RelatedCards/RelatedCard';
import { QuestionPreview } from 'components/common/QuestionPreview/QuestionPreview';
import { EvaluateTeachingPathNodeArticleItem, EvaluateTeachingPathNodeAssignmentItem } from '../../../../evaluation/api';

import '../CheckingPanel.scss';

interface Props {
  teachingPathEvaluationStore?: TeachingPathEvaluationStore;
}

@inject('teachingPathEvaluationStore')
@observer
export class TeachingPathCheckingPanel extends Component<Props> {

  public renderAssignmentCards = (step: EvaluationStep) => (
    step.items.map((item) => {
      const assignmentItem = item as EvaluateTeachingPathNodeAssignmentItem;
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

  public setComment = (questionId: number) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.teachingPathEvaluationStore!.setCommentToAnswer(e.target.value, questionId);
  }

  public renderQuestions = (step: EvaluationStep) => {
    const { teachingPathEvaluationStore } = this.props;
    const { commentsToAnswers } = teachingPathEvaluationStore!.currentEvaluation!.content;

    if (step.assignmentAnswers && step.assignmentAnswers.revisionContent && step.assignmentAnswers.revisionContent.questions
      && step.assignmentAnswers.revisionContent.questions.length) {
      const questions = step.assignmentAnswers.revisionContent.questions;
      return questions.map((question) => {
        const answer = step.assignmentAnswers!.revisionContent.answers.find(answer => answer.answerBlock.key.id === question.id);
        const questionComment = commentsToAnswers!.find(item => item.questionAnswerId === question.id);
        return (
            <QuestionPreview
              readOnly
              isTeacher
              isStudentView
              isEvaluationStyle
              withLargeCounter
              key={question.id}
              question={question}
              answer={answer && answer.answerBlock}
              comment={questionComment && questionComment.comment}
              handleChangeComment={this.setComment(question.id!)}
              isReadyToEvaluate={teachingPathEvaluationStore!.currentEvaluation!.isReadyToEvaluate}
            />
        );
      });
    }
  }

  public handleArticleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    window.open(`${process.env.REACT_APP_WP_URL}/education-article-iframe/?id=${e.currentTarget.id}`);
  }

  public renderArticleType = (step: EvaluationStep) =>
    step.items.map((item) => {
      const articleItem = item as EvaluateTeachingPathNodeArticleItem;
      return (
        <RelatedCard
          key={articleItem.id}
          type={step.type}
          title={articleItem.title}
          id={articleItem.id}
          image={articleItem.featuredImage}
          isChosen={articleItem.isSelected}
          handleClick={this.handleDomainClick}
        />
      );
    })

  public handleDomainClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const urlpath = e.currentTarget.getAttribute('data-url');
    window.open(`${urlpath}`);
  }

  public renderAssignmentType = (step: EvaluationStep) => (
    <>
      {this.renderAssignmentCards(step)}
      <div className={'teachingPathNodeQuestions'}>
        {this.renderQuestions(step)}
      </div>
    </>
  )

  public renderDomainType = (step: EvaluationStep) =>
  step.items.map((item) => {
    const articleItem = item as EvaluateTeachingPathNodeArticleItem;
    return (
      <RelatedCard
        key={articleItem.id}
        type={step.type}
        title={articleItem.title}
        id={articleItem.id}
        level={articleItem.levels}
        image={articleItem.featuredImage}
        isChosen={articleItem.isSelected}
        handleClick={this.handleDomainClick}
        url={articleItem.url}
      />
    );
  })
  public renderchooseTitle = (type: string) => {
    let chooseTitle = intl.get('evaluation_page.Choose article');
    if (type === 'ASSIGNMENT') {
      chooseTitle = intl.get('evaluation_page.Choose assignment');
    }
    if (type === 'DOMAIN') {
      chooseTitle = intl.get('evaluation_page.Choose domain');
    }
    if (type === 'ARTICLE') {
      chooseTitle = intl.get('evaluation_page.Choose article');
    }
    return chooseTitle;
  }

  public renderchooseContent = (step: EvaluationStep) => {
    const type = step.type;
    if (type === 'ASSIGNMENT') {
      return this.renderAssignmentType(step);
    }
    if (type === 'DOMAIN') {
      return this.renderDomainType(step);
    }
    if (type === 'ARTICLE') {
      return this.renderArticleType(step);
    }
    return this.renderArticleType(step);
  }

  public renderSteps = () => {
    const { teachingPathEvaluationStore } = this.props;
    if (!teachingPathEvaluationStore!.evaluationSteps.length) {
      return <div className={'flexBox alignCenter justifyCenter w100 h100'}><Loader /></div>;
    }

    return teachingPathEvaluationStore!.evaluationSteps.map((step: EvaluationStep, index: number) => (
      <div className={'teachingPathContainer'} key={step.nodeId}>
        <div className={'alignCenter stepCounterWrapper'}>
          <span className={'stepCounter'}>{index + 1}</span>
          <span className={'stepCounterTitle'}>
            {this.renderchooseTitle(step.type)}
          </span>
        </div>
        {this.renderchooseContent(step)}
      </div>
    ));
  }

  public render() {

    return (
      <div className={'teachingPathAnswersWrapper'}>
        {this.renderSteps()}
      </div>
    );
  }
}
