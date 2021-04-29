import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { observer, inject } from 'mobx-react';

import textIcon from 'assets/images/text.svg';
import multipleChoiceIcon from 'assets/images/multiple-choice.svg';
import teachingPathIcon from 'assets/images/teaching-path.svg';
import imageChoiceIcon from 'assets/images/image-choice.svg';

import { AttachmentContentTypeContext } from '../AttachmentContentTypeContext';
import { QuestionType } from 'assignment/Assignment';
import { CreationElements, NewAssignmentStore } from '../NewAssignmentStore';

import './AddQuestion.scss';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
}

const questionIcons = {
  [QuestionType.Text]: textIcon,
  [QuestionType.MultipleChoice]: multipleChoiceIcon,
  [QuestionType.TeachingPath]: teachingPathIcon,
  [QuestionType.ImageChoice]: imageChoiceIcon
};

const types = [
  QuestionType.Text,
  QuestionType.MultipleChoice,
  // QuestionType.TeachingPath,
  QuestionType.ImageChoice
];

@inject('newAssignmentStore')
@observer
export class AddQuestion extends Component<Props> {
  public static contextType = AttachmentContentTypeContext;

  private addQuestion = (type: QuestionType) => {
    const { newAssignmentStore } = this.props;
    newAssignmentStore!.addNewQuestion(type);
    newAssignmentStore!.setCurrentContentBlock(-1, -1);
    this.context.changeContentType(null);

    const counterQuestions = newAssignmentStore!.assignmentContainer!.assignment.questions.length - 1;
    newAssignmentStore!.setHighlightingItem(CreationElements.Questions, counterQuestions);
  }

  private renderNewQuestionType = (type: QuestionType) => (
    <NewQuestionTile key={type} type={type} onClick={this.addQuestion} />
  )

  public render() {
    return (
      <div className="AddQuestion">
        <div className="addQuestionPhase">
          {intl.get('new assignment.Add question')}
        </div>

        <div className="flexBox spaceBetween flexWrap">
          {types.map(this.renderNewQuestionType)}
        </div>
      </div>
    );
  }
}

interface NewQuestionTileProps {
  type: QuestionType;
  onClick: (type: QuestionType) => void;
}

class NewQuestionTile extends Component<NewQuestionTileProps> {
  private onClick = () => {
    const { type, onClick } = this.props;
    onClick(type);
  }

  public render() {
    const { type } = this.props;
    return (
      <button
        className="questionTypeBox flexBox alignCenter"
        key={type}
        onClick={this.onClick}
        title={intl.get(`new assignment.${type}`)}
      >
        <img src={questionIcons[type]} alt={intl.get(`generals.addQuestion_buttons.${type}`)} title={intl.get(`generals.addQuestion_buttons.${type}`)} />

        <div className={'questionWrapper'}>
          <div className="questionType fw500">
            {intl.get(`new assignment.${type}`)}
          </div>

          <div className={'questionTypeDescription'}>{intl.get(`new assignment.QUESTION_DESCRIPTION.${type}`)}</div>
        </div>
      </button>
    );
  }
}
