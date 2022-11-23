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
  private titleRef = React.createRef<HTMLTextAreaElement>();
  public handleChangeAnswer = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const value = event.currentTarget.value;
    this.props.answer.setValue(value);
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

          <textarea
            readOnly={readOnly}
            autoFocus={true}
            value={answer.value as string}
            className="studentsAnswer"
            placeholder={intl.get('new assignment.Write your answer here')}
            onChange={this.handleChangeAnswer}
            aria-required="true"
            aria-invalid="false"
            ref={this.titleRef}
          />
        </div>
      </div>
    );
  }
}
