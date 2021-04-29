import React, { Component } from 'react';
import intl from 'react-intl-universal';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { QuestionAttachment } from 'assignment/Assignment';
import { lettersNoEn } from 'utils/lettersNoEn';

import newTeachingPathQuestionIcon from 'assets/images/new-teaching-path-question.svg';
import textExtraIcon from 'assets/images/text-extra.svg';

import './NewTeachingPathQuestion.scss';

const MAX_ROWS = 3;

interface Props {
  newQuestionIndex: number;
  contentType: string;
  attachments: Array<QuestionAttachment>;
  setContentType: (contentType: string) => void;
}

export class NewTeachingPathQuestion extends Component<Props> {
  public state = {
    question: '',
    description: '',
  };

  public handleChangeNewQuestion = (e:  React.ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      this.setState({ question: e.target.value });
    }
  }

  public handleChangeNewDescription = (e:  React.ChangeEvent<HTMLTextAreaElement>) =>
    this.setState({ description: e.target.value })

  public render() {
    const { description, question } = this.state;
    const { newQuestionIndex, attachments } = this.props;

    return (
      <div className="NewTeachingPathQuestion">
        <div className="questionTitle flexBox spaceBetween alignCenter">
          <div className="flexBox alignCenter">
            <img
              src={newTeachingPathQuestionIcon}
              alt="New teacher path question"
            />
            {intl.get('new assignment.Teaching path')}
          </div>

          <div>
            {intl.get('new assignment.Question')} {newQuestionIndex + 1}
          </div>
        </div>

        <input
          className="newTextQuestionInput"
          placeholder={intl.get('new assignment.Enter a question')}
          value={question}
          onChange={this.handleChangeNewQuestion}
          aria-required="true"
          aria-invalid="false"
        />

        <div className="textExtra flexBox">
          <img src={textExtraIcon} alt="Extra text" />

          <textarea
            rows={MAX_ROWS}
            placeholder={intl.get('new assignment.enter_a_description')}
            value={description}
            onChange={this.handleChangeNewDescription}
          />
        </div>

        <div className="attached-files">
          {attachments.map(item => <img key={item.id} src={item.path} alt={item.path.split('/').pop()!.split('.')[0]}/>)}
        </div>

        <CreateButton light className="addAssignmentsButton" title={intl.get('new assignment.Add assignments')}>
          {intl.get('new assignment.Add assignments')}
        </CreateButton>
      </div>
    );
  }
}
