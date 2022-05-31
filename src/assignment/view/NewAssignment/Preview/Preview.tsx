import React, { Component, Fragment } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import isNil from 'lodash/isNil';

import { QuestionPreview } from 'components/common/QuestionPreview/QuestionPreview';
import { Pagination } from './Pagination/Pagination';

import smileyIcon from 'assets/images/smiley.svg';

import './Preview.scss';
import '../AddQuestion/AddQuestion.scss';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';
import { NewAssignmentStore } from '../NewAssignmentStore';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { RelatedArticlesPreview } from './RelatedArticlesPreview/RelatedArticlesPreview';
import { AttachmentsListWrapper } from '../AttachmentsList/AttachmentsListWrapper';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
export class Preview extends Component<Props> {
  public static contextType = AttachmentContentTypeContext;
  private renderAttachmentsList() {
    return (
      <AttachmentsListWrapper context={this.context}/>
    );
  }

  private renderRelatedArticlesList() {
    return <RelatedArticlesPreview/>;
  }

  private isNoQuestions = (): JSX.Element => (
    <Fragment>
      <img src={smileyIcon} alt="Nothing to see yet!"/>

      <span className="nothingPhrase">
        {intl.get('new assignment.Nothing to see yet')}
      </span>

      <span className="previewPhrase">
        {intl.get('new assignment.Preview assignment here')}
      </span>
    </Fragment>
  )

  private renderQuestion = (): JSX.Element => {
    const { newAssignmentStore } = this.props;

    return (
      <div className="questionPreviewContainer flexBox dirColumn spaceBetween">
        <div className="previewHeadPhrase fw500">
          {intl.get('new assignment.Preview')}
        </div>

        <div className={'previewQuestion'}>
          <QuestionPreview
            question={newAssignmentStore!.currentQuestion!}
            readOnly
            withQuestionCounter
            isStudentView
          />
        </div>
      </div>
    );
  }

  public renderPagination = () => {
    const { newAssignmentStore } = this.props;

    return (
      <div className={'paginationPanel'}>
        <Pagination currentAssignment={newAssignmentStore!.currentEntity as DraftAssignment}/>
      </div>
    );
  }

  public render() {
    const { newAssignmentStore } = this.props;
    const isAttachmentsListVisible =
      this.context.contentType === AttachmentContentType.image || this.context.contentType === AttachmentContentType.customImage || this.context.contentType === AttachmentContentType.video;
    const isRelatedArticlesVisible = this.context.contentType === AttachmentContentType.articles;
    const isQuestionsVisible = !isAttachmentsListVisible && newAssignmentStore!.currentQuestion;
    const isVisiblePagination =
      this.context.contentType === AttachmentContentType.text || isNil(this.context.contentType);

    return (
        <div className="NewAssignmentPreview flexBox justifyCenter alignCenter dirColumn w50">
          {isAttachmentsListVisible && this.renderAttachmentsList()}
          {isRelatedArticlesVisible && this.renderRelatedArticlesList()}
          {isQuestionsVisible && this.renderQuestion()}
          {!isAttachmentsListVisible && newAssignmentStore!.currentEntity!.questions.length === 0 && this.isNoQuestions()}
          {isVisiblePagination && newAssignmentStore!.currentEntity!.questions.length > 0 && this.renderPagination()}
        </div>
    );
  }
}
