import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { SortableElement, SortEnd, SortEvent } from 'react-sortable-hoc';
import TextAreaAutosize from 'react-textarea-autosize';

import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { MoreOptions } from '../../MoreOptions/MoreOptions';
import { CreationElements, NewAssignmentStore } from '../../NewAssignmentStore';
import { ContentBlockType } from '../../../../ContentBlock';
import { QuestionContentPanel } from '../QuestionContentPanel';
import { MappingContentBlocks } from '../MappingContentBlocks';
import { AttachmentContentTypeContext } from '../../AttachmentContentTypeContext';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_DESCRIPTION_LENGTH } from 'utils/constants';

import textQuestionIcon from 'assets/images/new-text-question.svg';
import textQuestionIconPink from 'assets/images/new-text-question-pink.svg';

import '../Questions.scss';

interface TextQuestionProps {
  question: EditableQuestion;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
class TextQuestionContent extends Component<TextQuestionProps> {
  public static contextType = AttachmentContentTypeContext;

  public addNewContentBlock = (type: ContentBlockType): void => {
    const { question, newAssignmentStore } = this.props;

    question.addContentBlock(type, question);
    const filteredBlocks = question.content.filter(block => block.type === type);
    newAssignmentStore!.setPreviewQuestionByIndex(question.orderPosition);
    newAssignmentStore!.setCurrentContentBlock(question.orderPosition, filteredBlocks[filteredBlocks.length - 1].order);
    newAssignmentStore!.setHighlightingItem(CreationElements.Questions, question.orderPosition);
  }

  public handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { question } = this.props;
    if (lettersNoEn(e.target.value)) {
      question.setTitle(e.target.value);
    }
  }

  public onSortEnd = (data: SortEnd, event: SortEvent) => {
    const { question } = this.props;

    question.reorderContentBlocks(
      data.oldIndex,
      data.newIndex
    );
  }

  public render() {
    const { question, newAssignmentStore } = this.props;
    const order = question.orderPosition + 1;
    const lightItem = newAssignmentStore!.isHighlightedItem(CreationElements.Questions, question.orderPosition) ? 'lightItem' : '';
    const hasError = newAssignmentStore!.currentEntity!.questionsWithErrors === question.orderPosition;

    return (
      <div className={`NewTextQuestion flexBox dirColumn ${lightItem} ${hasError && 'hasError'}`}>
        <div className="questionTitle flexBox spaceBetween alignCenter">
          <div className="flexBox alignCenter">
            <img src={hasError ? textQuestionIconPink : textQuestionIcon} alt="Text question" className={'questionIcon'}/>
            <span className={`questionTitleText ${hasError && 'questionTitleText-hasError'}`}>{intl.get('new assignment.TEXT')}</span>
          </div>

          <div className={`${hasError && 'questionTitleText-hasError'} flexBox`}>
            {intl.get('new assignment.Question')} {order}
            <MoreOptions
              question={question}
              newAssignmentStore={newAssignmentStore}
            />
          </div>
        </div>

        <TextAreaAutosize
          className={`newTextQuestionInput ${lightItem}`}
          placeholder={intl.get('new assignment.Enter a question')}
          value={question.title}
          onChange={this.handleChangeTitle}
          maxLength={MAX_DESCRIPTION_LENGTH}
        />

        <MappingContentBlocks question={question} helperClass="content-block-dragged" onSortEnd={this.onSortEnd} useDragHandle />

        <div className="flexBox spaceBetween alignCenter questionControlPanel">
          <QuestionContentPanel
            question={question}
            addNewContentBlock={this.addNewContentBlock}
          />
        </div>
      </div>
    );
  }
}

export const TextQuestionComponent = SortableElement(TextQuestionContent);
