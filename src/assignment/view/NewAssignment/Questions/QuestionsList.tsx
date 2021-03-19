import React, { Component, createRef, ReactElement } from 'react';
import { SortableContainer, SortEnd, SortEvent } from 'react-sortable-hoc';
import { inject, observer } from 'mobx-react';

import {
  DraftAssignment,
  EditableQuestion,
  EditableMultipleChoiceQuestion,
  EditableTextQuestion,
  EditableImageChoiceQuestion
} from 'assignment/assignmentDraft/AssignmentDraft';
import { TextQuestionComponent } from './TextQuestion/TextQuestionComponent';
import { MultipleChoiceQuestionComponent } from './MultipleChoiceQuestion/MultipleChoiceQuestionComponent';
import { CreationElements, NewAssignmentStore } from '../NewAssignmentStore';
import { ImageChoiceQuestionComponent } from '../AddQuestion/ImageChoiceQuestion/ImageChoiceQuestionComponent';
import { AttachmentContentType, AttachmentContentTypeContext } from '../AttachmentContentTypeContext';

interface QuestionsListProps {
  assignment: DraftAssignment;
}

interface QuestionsComponentProps {
  questions: Array<EditableQuestion>;
  newAssignmentStore?: NewAssignmentStore;
}

@observer
export class QuestionsList extends Component<QuestionsListProps> {
  private onSortEnd = (data: SortEnd, event: SortEvent) => {
    const { assignment } = this.props;

    assignment.reorderQuestions(
      data.oldIndex,
      data.newIndex
    );
  }

  public render() {
    const { assignment } = this.props;
    const distance = 10;

    return (
      <QuestionsListHolder
        helperClass="z10"
        distance={distance}
        questions={assignment.questions}
        onSortEnd={this.onSortEnd}
      />
    );
  }
}

@inject('newAssignmentStore')
@observer
class QuestionsListComponent extends Component<QuestionsComponentProps, {}> {
  public static contextType = AttachmentContentTypeContext;

  private refArray: Array<React.RefObject<HTMLInputElement>>;

  constructor(props: QuestionsComponentProps) {
    super(props);
    this.refArray = [];
  }

  private questionComponentFactory = (question: EditableQuestion): ReactElement | null => {
    const key = `question-${question.orderPosition}`;

    const currentRef: React.RefObject<HTMLInputElement> = createRef();
    this.refArray[question.orderPosition] = currentRef;

    switch (true) {
      case question instanceof EditableTextQuestion:
        return (
          <div ref={currentRef} key={key} onClick={this.setHighlightedItem(question.orderPosition)}>
              <TextQuestionComponent
                index={question.orderPosition}
                question={question}
              />
          </div>

        );
      case question instanceof EditableMultipleChoiceQuestion:
        const multipleChoiceQuestion = question as EditableMultipleChoiceQuestion;

        return (
          <div ref={currentRef} key={key} onClick={this.setHighlightedItem(question.orderPosition)}>
            <MultipleChoiceQuestionComponent
              index={multipleChoiceQuestion.orderPosition}
              question={multipleChoiceQuestion}
            />
          </div>
        );
      case question instanceof EditableImageChoiceQuestion:
        const imageChoiceQuestion = question as EditableImageChoiceQuestion;

        return (
          <div ref={currentRef} key={key} onClick={this.setHighlightedItem(question.orderPosition)}>
            <ImageChoiceQuestionComponent
              index={imageChoiceQuestion.orderPosition}
              question={imageChoiceQuestion}
            />
          </div>
        );
      default:
        return null;
    }
  }

  public setHighlightedItem = (order: number) => () => {
    const { newAssignmentStore } = this.props;
    newAssignmentStore!.setHighlightingItem(CreationElements.Questions, order);
    newAssignmentStore!.setPreviewQuestionByIndex(order);
    newAssignmentStore!.setCurrentContentBlock(-1, -1);
    this.context.changeContentType(AttachmentContentType.text);
  }

  public scrollToQuestion = () => {
    const currentQuestion = this.props.newAssignmentStore!.currentQuestion;
    if (currentQuestion) {
      const questionNumber = currentQuestion!.orderPosition;
      if (this.refArray[questionNumber] && this.refArray[questionNumber].current) {
        const element = this.refArray[questionNumber] as React.RefObject<HTMLInputElement>;
        if (element.current) {
          element.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }

  public render() {
    this.scrollToQuestion();
    return (
      <div>
        {this.props.questions.map(this.questionComponentFactory)}
      </div>
    );
  }
}

const QuestionsListHolder = SortableContainer(
  QuestionsListComponent,
);
