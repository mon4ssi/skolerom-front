import React, { Component } from 'react';
import classnames from 'classnames';

import { MultipleChoiceQuestionOption } from 'assignment/Assignment';
import { Answer } from 'assignment/questionary/Questionary';
import { AnswerMappingContentBlock } from '../AnswerMappingContentBlocks';

import checkInactiveIcon from 'assets/images/ckeck-inactive.svg';
import checkActiveIcon from 'assets/images/check-active.svg';

import './AnswerMultipleChoiceQuestion.scss';

interface Props {
  answer: Answer;
  readOnly: boolean;
}

interface RenderOptionProps {
  option: MultipleChoiceQuestionOption;
  answer: Answer;
  handleChooseAnswer: (title: string) => void;
  readOnly: boolean;
}

const RenderOption = (props: RenderOptionProps) => {
  const { answer, option, handleChooseAnswer, readOnly } = props;

  const setIsRight = () => {
    handleChooseAnswer(option.title);
  };

  const isValueSelected = answer.value.includes(option.title);

  return (
    <div className={classnames('option fw500 dirColumn', isValueSelected && 'isRight')}>
      <div className="flexBox alignCenter spaceBetween w100">
        <input
          className="fw500"
          value={option.title}
          readOnly
        />

        <div className="statusBox" onClick={setIsRight}>
          <img
            src={isValueSelected ? checkActiveIcon : checkInactiveIcon}
            alt="Status"
            // className="checkStatus"
            className={classnames('checkStatus', readOnly && 'readOnly')}
          />
        </div>
      </div>
    </div>
  );
};

export class AnswerMultipleChoiceQuestion extends Component<Props> {

  public componentDidMount() {
    document.getElementById('currentAssignmentPage')!.focus();
    // Focus root CurrentAssignmentPage div for correct work of handleKeyboardControl
  }

  public handleChooseAnswer = (title: string) => {
    const { answer, readOnly } = this.props;
    if (readOnly) return;
    let answerValue = answer.value as Array<string>;
    answerValue.includes(title) ?
      answerValue = answerValue.filter(item => item !== title) :
      answerValue = [...answerValue, title];

    this.props.answer.setValue(answerValue);
  }

  public renderOptions = () => (
    this.props.answer.key.options.map((option, index) => (
      <RenderOption
        readOnly={this.props.readOnly}
        answer={this.props.answer}
        option={option}
        key={`option-${option.title}-${index}`}
        handleChooseAnswer={this.handleChooseAnswer}
      />
    ))
  )

  public render() {
    const { answer } = this.props;
    const { key: question } = answer;

    return (
      <div className="AnswerMultipleChoiceQuestion flexBox dirColumn">

        <div className="currentQuestionPreviewTextWrapper fw500">
          <div className="currentQuestionPreviewText">
            {question.title}
          </div>
        </div>

        <AnswerMappingContentBlock question={question}/>

        <div className="options">{this.renderOptions()}</div>
      </div>
    );
  }
}
