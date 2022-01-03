import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { Answer } from 'assignment/questionary/Questionary';
import { AnswerMappingContentBlock } from '../AnswerMappingContentBlocks';
import { lettersNoEn } from 'utils/lettersNoEn';

import './AnswerTextQuestion.scss';
const ENTER_SINGLE_QUOTE_CODE = 219;
const ENTER_DOUBLE_QUOTE_CODE = 50;
const DELAY = 100;
interface Props {
  answer: Answer;
  readOnly: boolean;
}

export class AnswerTextQuestion extends Component<Props> {
  private titleRef = React.createRef<HTMLTextAreaElement>();
  public handleChangeAnswer = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    /*if (lettersNoEn(event.target.value)) {
      this.props.answer.setValue(event.target.value);
    }*/
    event.preventDefault();
    const value = this.useValuedQuotes(event.currentTarget.value);
    this.props.answer.setValue(value);
  }
  public focusTextField  = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const startQuote = '«»';
    const isDoubleQuote = (e.shiftKey && e.keyCode === ENTER_DOUBLE_QUOTE_CODE) ? true : false;
    if (isDoubleQuote || e.keyCode === ENTER_SINGLE_QUOTE_CODE) {
      setTimeout(
        () => {
          this.titleRef.current!.selectionEnd = Number(this.titleRef.current!.value!.split(startQuote)[0].length) + 1;
          this.titleRef.current!.focus();
        },
        DELAY
      );
    }
  }

  public useValuedQuotes = (value: string) => {
    const startQuote = '«';
    const endQuote = '»';
    let newvalue = value;
    if (value.split("'").length > 1 || value.split('"').length > 1) {
      const initValue = (value.split("'").length > 1) ? value.split("'")[0] : value.split('"')[0];
      const secondValue = (value.split("'").length > 1) ? value.split("'")[1] : value.split('"')[1];
      newvalue = `${initValue}${startQuote}${endQuote}${secondValue}`;
    }
    return newvalue;
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
            onKeyUp={this.focusTextField}
            aria-required="true"
            aria-invalid="false"
            ref={this.titleRef}
          />
        </div>
      </div>
    );
  }
}
