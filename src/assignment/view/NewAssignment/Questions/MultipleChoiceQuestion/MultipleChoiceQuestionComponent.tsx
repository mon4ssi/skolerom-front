import React, { Component, createRef } from 'react';
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
import teaGuiBGImg from 'assets/images/guidance-bg.svg';

interface Props {
  question: EditableMultipleChoiceQuestion;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
class MultipleChoiceQuestionContent extends Component<Props> {
  public static contextType = AttachmentContentTypeContext;
  private refbutton = createRef<HTMLButtonElement>();
  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

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
    e.preventDefault();
    const value = e.currentTarget.value;
    question.setTitle(value);
    /* if (lettersNoEn(value)) {
      question.setTitle(value);
    } */
  }

  public async componentDidUpdate() {
    if (this.refbutton.current && this.props.newAssignmentStore!.showDeleteButton) {
      this.refbutton.current!.focus();
      this.props.newAssignmentStore!.showDeleteButton = false;
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

  public openModalTGAssig = (nroLevel: string) => {
    this.props.newAssignmentStore!.openTeacherGuidanceAssig(nroLevel);
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
        </div>

        <label id={titleId} className="hidden">{intl.get('new assignment.Enter a question')}</label>
        <TextAreaAutosize
          className={`newTextQuestionInput ${lightItem}`}
          placeholder={intl.get('new assignment.Enter a question')}
          value={question.title}
          onChange={this.handleChangeTitle}
          inputRef={this.titleRef}
          maxLength={MAX_DESCRIPTION_LENGTH}
          aria-labelledby={titleId}
          autoFocus
        />
        <div className="absQuestionMoreOptions">
          <div className={`${hasError && 'questionTitleText-hasError'} flexBox`}>
            {intl.get('new assignment.Question')} {question.orderPosition + 1}
            <MoreOptions
              question={question}
              newAssignmentStore={newAssignmentStore}
            />
          </div>
        </div>

        <MappingContentBlocks question={question} helperClass="content-block-dragged" onSortEnd={this.onSortEnd} useDragHandle />

        <div className="flexBox spaceBetween alignCenter questionControlPanel">
          <QuestionContentPanel
            question={question}
            addNewContentBlock={this.addNewContentBlock}
          />
        </div>

        <OptionsList question={question} setCurrentQuestion={this.setCurrentQuestion} />

        <div className={'functionalButtons'}>
          <button
            className="CreateButton newAnswerButtons"
            onClick={this.addNewOption}
            title={intl.get('new assignment.New answer')}
            ref={this.refbutton}
          >
            {intl.get('new assignment.New answer')}
          </button>
          <div className="sectionGuidance">
            <CreateButton
              title={newAssignmentStore!.getTitleButtonGuidance}
              onClick={this.openModalTGAssig.bind(this, String(question.orderPosition + 1))}
            >
              <img src={teaGuiBGImg} alt={newAssignmentStore!.getTitleButtonGuidance} />
              {newAssignmentStore!.getTitleButtonGuidance}
            </CreateButton>
          </div>
        </div>

      </div>
    );
  }
}

export const MultipleChoiceQuestionComponent = SortableElement(
  MultipleChoiceQuestionContent
);
