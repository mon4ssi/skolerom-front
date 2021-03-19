import React, { Component, MouseEvent } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import isNil from 'lodash/isNil';

import { AssignmentEvaluationStore } from '../../../EvaluationDraft/AssignmentEvaluationStore';
import { StoreState } from 'utils/enums';
import { Loader } from 'components/common/Loader/Loader';
import { Article } from '../../../Assignment';
import { QuestionPreview } from 'components/common/QuestionPreview/QuestionPreview';

import '../CheckingPanel.scss';
import { RelatedCard } from './RelatedCards/RelatedCard';

interface Props {
  assignmentEvaluationStore?: AssignmentEvaluationStore;
}

@inject('assignmentEvaluationStore')
@observer
export class AssignmentsCheckingPanel extends Component<Props> {

  public handleArticleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    window.open(`${process.env.REACT_APP_WP_URL}/education-article-iframe/?id=${e.currentTarget.id}`);
  }

  public renderReadArticle = (article: Article) =>
    (
      <RelatedCard
        key={article.id}
        level={article.readLevel!.level}
        image={article.images && article.images.url}
        id={article.id}
        title={article.title}
        type={'ARTICLE'}
        handleClick={this.handleArticleClick}
      />
    )

  public renderReadArticlesList = () => {
    const { relatedArticles } = this.props.assignmentEvaluationStore!;

    return relatedArticles.length ? (
      <div className="readArticlesContainer">
        <p className="readArticlesContainer__header">
          {intl.get('answers.article_read')}
        </p>
        {relatedArticles.map(this.renderReadArticle)}
      </div>
    ) : null;
  }

  public setComment = (questionId: number) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.assignmentEvaluationStore!.setCommentToAnswer(e.target.value, questionId);
  }

  public renderQuestions = () => {
    const { assignmentEvaluationStore } = this.props;

    if (assignmentEvaluationStore!.evaluationAnswers && assignmentEvaluationStore!.evaluationAnswers.revisionContent) {
      if (assignmentEvaluationStore!.evaluationAnswers.revisionContent.questions.length > 0) {
        const questions = assignmentEvaluationStore!.evaluationAnswers.revisionContent.questions;

        return questions.map((question) => {
          const answer = assignmentEvaluationStore!.evaluationAnswers!.answers.find(answer => answer.answerBlock.key.id === question.id);
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
               comment={answer && answer.comment}
               handleChangeComment={this.setComment(question.id!)}
               isReadyToEvaluate={assignmentEvaluationStore!.currentEvaluation!.isReadyToEvaluate}
             />
          );
        }
        );
      }
    }
  }

  public render() {
    const { assignmentEvaluationStore } = this.props;

    if (isNil(assignmentEvaluationStore!.evaluationAnswers) || assignmentEvaluationStore!.relatedArticlesState === StoreState.LOADING) {
      return <div className={'flexBox alignCenter justifyCenter w100 h100 loader'}><Loader /></div>;
    }

    return (
      <div className={'answerWrapper'}>
        {this.renderReadArticlesList()}

        <div className="answers">
          {this.renderQuestions()}
        </div>
      </div>
    );
  }
}
