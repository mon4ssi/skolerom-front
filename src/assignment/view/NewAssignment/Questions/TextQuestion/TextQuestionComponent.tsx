import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import { SortableElement, SortEnd, SortEvent } from 'react-sortable-hoc';
import TextAreaAutosize from 'react-textarea-autosize';

import { EditableQuestion, EditableTextQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
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
import checkInactive from 'assets/images/ckeck-inactive.svg';
import checkActive from 'assets/images/check-active.svg';

import '../Questions.scss';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import teaGuiBGImg from 'assets/images/guidance-bg.svg';

interface TextQuestionProps {
  question: EditableQuestion;
  newAssignmentStore?: NewAssignmentStore;
}
interface State {
  hiddenQuestion: boolean | undefined;
}

@inject('newAssignmentStore')
@observer
class TextQuestionContent extends Component<TextQuestionProps, State> {
  public static contextType = AttachmentContentTypeContext;
  public state = {
    hiddenQuestion: false
  };
  public titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  public componentDidMount() {
    const { question } = this.props;
    this.setState({ hiddenQuestion: question.hide_answer });
  }

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
    e.preventDefault();
    const value = e.currentTarget.value;
    if (lettersNoEn(value)) {
      question.setTitle(value);
    }
  }

  public onSortEnd = (data: SortEnd, event: SortEvent) => {
    const { question } = this.props;

    question.reorderContentBlocks(
      data.oldIndex,
      data.newIndex
    );
  }

  public openModalTGAssig = (nroLevel: string) => {
    this.props.newAssignmentStore!.openTeacherGuidanceAssig(nroLevel);
  }

  public toggleHiddenQuestion = (event: React.MouseEvent<HTMLDivElement>) => {
    const { question } = this.props;
    event.preventDefault();
    if (this.state.hiddenQuestion) {
      this.setState({
        hiddenQuestion: false
      });
      if (question instanceof EditableTextQuestion) {
        question.setHiddenQuestion(false);
      }
    } else {
      this.setState({
        hiddenQuestion: true
      });
      if (question instanceof EditableTextQuestion) {
        question.setHiddenQuestion(true);
      }
    }
  }

  public render() {
    const { question, newAssignmentStore } = this.props;
    const order = question.orderPosition + 1;
    const titleId = `id_question_${question.orderPosition}`;
    const lightItem = newAssignmentStore!.isHighlightedItem(CreationElements.Questions, question.orderPosition) ? 'lightItem' : '';
    const hasError = newAssignmentStore!.currentEntity!.questionsWithErrors === question.orderPosition;

    return (
      <div className={`NewTextQuestion flexBox dirColumn ${lightItem} ${hasError && 'hasError'}`}>
        <div className="questionTitle flexBox spaceBetween alignCenter">
          <div className="flexBox alignCenter">
            <img src={hasError ? textQuestionIconPink : textQuestionIcon} alt="Text question" className={'questionIcon'}/>
            <span className={`questionTitleText ${hasError && 'questionTitleText-hasError'}`}>{intl.get('new assignment.TEXT')}</span>
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
            {intl.get('new assignment.Question')} {order}
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
        <div className="sectionGuidance sectionNotSpace">
          <CreateButton
            title={newAssignmentStore!.getTitleButtonGuidance}
            onClick={this.openModalTGAssig.bind(this, String(order))}
          >
            <img src={teaGuiBGImg} alt={newAssignmentStore!.getTitleButtonGuidance} />
            {newAssignmentStore!.getTitleButtonGuidance}
          </CreateButton>
          <div className="hiddenQuestionCheck" onClick={this.toggleHiddenQuestion}>
            <img src={this.state.hiddenQuestion ? checkActive : checkInactive} alt="checkbox" className="AssignmentArticlesToReading__checkbox"/>
            <div>
              {intl.get('assignments search.hidden_question')}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const TextQuestionComponent = SortableElement(TextQuestionContent);
