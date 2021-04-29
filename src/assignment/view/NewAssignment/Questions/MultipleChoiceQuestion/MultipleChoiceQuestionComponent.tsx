import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { SortableElement, SortEnd, SortEvent } from 'react-sortable-hoc';
import TextAreaAutosize from 'react-textarea-autosize';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { MoreOptions } from '../../MoreOptions/MoreOptions';
import { EditableMultipleChoiceQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { OptionsList } from './OptionsList';
import { CreationElements, NewAssignmentStore } from '../../NewAssignmentStore';
import { QuestionContentPanel } from '../QuestionContentPanel';
import { ContentBlockType } from '../../../../ContentBlock';
import { AttachmentContentTypeContext } from '../../AttachmentContentTypeContext';
import { MappingContentBlocks } from '../MappingContentBlocks';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_DESCRIPTION_LENGTH } from 'utils/constants';

import newMultipleChoiceQuestionIcon from 'assets/images/new-multiple-choice-question.svg';
import newMultipleChoiceQuestionIconPink from 'assets/images/new-multiple-choice-question-pink.svg';

interface Props {
  question: EditableMultipleChoiceQuestion;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
class MultipleChoiceQuestionContent extends Component<Props> {
  public static contextType = AttachmentContentTypeContext;

  private addNewOption = () => {
    const { question } = this.props;

    question.addNewOption();
  }

  private setCurrentQuestion = () => {
    const { question, newAssignmentStore } = this.props;
    newAssignmentStore!.setPreviewQuestionByIndex(question.orderPosition);
    newAssignmentStore!.setHighlightingItem(CreationElements.Questions, question.orderPosition);
  }

  private handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { question } = this.props;
    if (lettersNoEn(e.target.value)) {
      question.setTitle(e.target.value);
    }
  }

  private changeKeyFunction = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.altKey && e.key === 'S' || e.altKey && e.key === 's') {
      e.preventDefault();
    }
  }

  public addNewContentBlock = (type: ContentBlockType) => {
    const { question, newAssignmentStore } = this.props;

    question.addContentBlock(type, question);
    const filteredBlocks = question.content.filter(block => block.type === type);
    newAssignmentStore!.setPreviewQuestionByIndex(question.orderPosition);
    newAssignmentStore!.setCurrentContentBlock(question.orderPosition, filteredBlocks[filteredBlocks.length - 1].order);
    newAssignmentStore!.setHighlightingItem(CreationElements.Questions, question.orderPosition);
  }

  public onSortEnd = (data: SortEnd, event: SortEvent) => {
    event.preventDefault();
    const { question } = this.props;

    question.reorderContentBlocks(
      data.oldIndex,
      data.newIndex
    );
  }

  public render() {
    const { question, newAssignmentStore } = this.props;
    const lightItem = newAssignmentStore!.isHighlightedItem(CreationElements.Questions, question.orderPosition) ? 'lightItem' : '';
    const hasError = newAssignmentStore!.currentEntity!.questionsWithErrors === question.orderPosition;
    const titleId = `id_question_${question.orderPosition}`;

    return (
      <div className={`NewMultipleChoiceQuestion flexBox dirColumn ${lightItem} ${hasError && 'hasError'}`} onClick={this.setCurrentQuestion}>
        <div className="questionTitle flexBox spaceBetween alignCenter">
          <div className="flexBox alignCenter">
            <img
              src={hasError ? newMultipleChoiceQuestionIconPink : newMultipleChoiceQuestionIcon}
              alt="New multiple choice question"
              className={'questionIcon'}
            />
            <span className={`questionTitleText ${hasError && 'questionTitleText-hasError'}`}>{intl.get('new assignment.MULTIPLE_CHOICE')}</span>
          </div>

          <div className={`${hasError && 'questionTitleText-hasError'} flexBox`}>
            {intl.get('new assignment.Question')} {question.orderPosition + 1}
            <MoreOptions
              question={question}
              newAssignmentStore={newAssignmentStore}
            />
          </div>
        </div>

        <label id={titleId} className="hidden">{intl.get('new assignment.Enter a question')}</label>
        <TextAreaAutosize
          className={`newTextQuestionInput ${lightItem}`}
          placeholder={intl.get('new assignment.Enter a question')}
          value={question.title}
          onChange={this.handleChangeTitle}
          maxLength={MAX_DESCRIPTION_LENGTH}
          onKeyDown={this.changeKeyFunction}
          aria-labelledby={titleId}
          autoFocus
        />

        <MappingContentBlocks question={question} helperClass="content-block-dragged" onSortEnd={this.onSortEnd} useDragHandle />

        <div className="flexBox spaceBetween alignCenter questionControlPanel">
          <QuestionContentPanel
            question={question}
            addNewContentBlock={this.addNewContentBlock}
          />
        </div>

        <OptionsList question={question} setCurrentQuestion={this.setCurrentQuestion} />

        <div className={'functionalButtons'}>
          <CreateButton
            className="newAnswerButtons"
            onClick={this.addNewOption}
            title={intl.get('new assignment.New answer')}
          >
            {intl.get('new assignment.New answer')}
          </CreateButton>
        </div>

      </div>
    );
  }
}

export const MultipleChoiceQuestionComponent = SortableElement(
  MultipleChoiceQuestionContent
);
