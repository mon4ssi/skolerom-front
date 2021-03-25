import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { Answer } from 'assignment/questionary/Questionary';
import { AnswerMappingContentBlock } from '../AnswerMappingContentBlocks';
import { lettersNoEn } from 'utils/lettersNoEn';

import './AnswerTextQuestion.scss';

interface Props {
  answer: Answer;
  readOnly: boolean;
}

export class AnswerTextQuestion extends Component<Props> {
  public handleChangeAnswer = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(event.target.value)) {
      this.props.answer.setValue(event.target.value);
    }
  }

  public render() {
    const { answer, readOnly } = this.props;
    const { key: question } = answer;

    return (
      <div className="AnswerTextQuestion flexBox dirColumn">
        <div className="currentQuestionPreviewTextWrapper fw500">
          <div className="currentQuestionPreviewText">
            {question.title}
          </div>

          <AnswerMappingContentBlock question={question}/>

          <input
            readOnly={readOnly}
            autoFocus={true}
            value={answer.value as string}
            className="studentsAnswer"
            placeholder={intl.get('new assignment.Write your answer here')}
            onChange={this.handleChangeAnswer}
            aria-required="true"
            aria-invalid="false"
          />
        </div>
      </div>
    );
  }
}
