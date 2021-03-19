import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { MultipleChoiceQuestion, MultipleChoiceQuestionOption, TypedQuestion } from 'assignment/Assignment';
import { EditableMultipleChoiceQuestion, EditableMultipleChoiceQuestionOption, EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { Answer, RedirectData } from 'assignment/questionary/Questionary';
import { LocationState } from 'assignment/view/CurrentAssignmentPage/CurrentAssignmentPage';

import select from 'assets/images/select.svg';
import selectBlueGray from 'assets/images/select-blue-gray.svg';

import './MultipleChoiceQuestionPreview.scss';

type Question = TypedQuestion | EditableQuestion;
type QuestionOptions = Array<MultipleChoiceQuestionOption | EditableMultipleChoiceQuestionOption>;

interface Props {
  question: Question;
  answer?: Answer;
  readOnly?: boolean;
  redirectData?: RedirectData;
  isEvaluationStyle?: boolean;
  isStudentView?: boolean;
  handleShowArrowsTooltip?(status: boolean): void;
}

interface RenderOptionProps {
  question: Question;
  option: MultipleChoiceQuestionOption | EditableMultipleChoiceQuestionOption;
  readOnly?: boolean;
  answer?: Answer;
  handleChooseAnswer: (title: string) => void;
  isEvaluationStyle?: boolean;
  isStudentView?: boolean;
}

@observer
class RenderOption extends Component<RenderOptionProps>{

  public setIsRight = () => {
    const { handleChooseAnswer, option } = this.props;
    handleChooseAnswer(option.title);
  }

  public calculateIsRightStyle = () => {
    const { option, answer, isEvaluationStyle, isStudentView } = this.props;
    const isValueSelected = answer && answer.value.includes(option.title);

    if (isEvaluationStyle) {
      return option.isRight ? 'isRight evaluationOption' : (isValueSelected && !option.isRight) ? 'evaluationOption isWrong' : 'evaluationOption';
    }
    return (isValueSelected && isStudentView) ? 'studentViewIsRight' : isValueSelected ? 'Option_selected' : '';
  }

  public calculateIsRightInputStyle = () => {
    const { option, answer, isEvaluationStyle } = this.props;
    const isValueSelected = answer && answer.value.includes(option.title);

    if (isEvaluationStyle) {
      return option.isRight ? 'Option__input_right' : (isValueSelected && !option.isRight) ? 'Option__input_wrong' : '';
    }
  }

  public render() {
    const { option, answer, readOnly, isEvaluationStyle, isStudentView } = this.props;
    const isValueSelected = answer && answer.value.includes(option.title);
    const statusClassNames = classnames('Option__status',  {
      evaluationStatus: isEvaluationStyle,
      Option__status_selected: isValueSelected,
      Option__defaultCursor: readOnly
    });
    const inputClassNames = classnames(`Option__text fw500 fs17 ${this.calculateIsRightInputStyle()}`, {
      Option__defaultCursor: readOnly
    });

    return (
      <div className={`Option ${this.calculateIsRightStyle()} ${isStudentView && 'light'}`}>
        <div className={inputClassNames}>
          {option.title}
        </div>

        <div className={statusClassNames} onClick={this.setIsRight}>
          <img
            src={isValueSelected ? select : selectBlueGray}
            alt="Status"
            className={classnames('Option__image', readOnly && 'readOnly')}
          />
        </div>
      </div>
    );
  }
}

@observer
class MultipleChoiceQuestionPreviewComponent extends Component<Props & RouteComponentProps<{}, {}, LocationState>> {

  public handleChooseAnswer = (title: string) => {
    const { answer, readOnly, redirectData, handleShowArrowsTooltip } = this.props;
    if (readOnly) return;
    let answerValue = answer!.value as Array<string>;

    if (handleShowArrowsTooltip) {
      handleShowArrowsTooltip(true);
    }

    answerValue.includes(title) ?
      answerValue = answerValue.filter(item => item !== title) :
      answerValue = [...answerValue, title];

    answer!.setValue(answerValue, redirectData);
  }

  public renderOptions = () => {
    const { question, answer, readOnly, isEvaluationStyle, isStudentView } = this.props;
    return (
      ((question as MultipleChoiceQuestion | EditableMultipleChoiceQuestion).options as QuestionOptions).map(
      (option, index) => (
        <RenderOption
          key={`option-${option.title}-${index}`}
          readOnly={readOnly}
          question={question}
          answer={answer}
          option={option}
          isEvaluationStyle={isEvaluationStyle}
          handleChooseAnswer={this.handleChooseAnswer}
          isStudentView={isStudentView}
        />
    ))

    );
  }

  public render() {
    return (
      <div className="Options">
        <div className="Options__item">{this.renderOptions()}</div>
      </div>
    );
  }
}

export const MultipleChoiceQuestionPreview = withRouter(MultipleChoiceQuestionPreviewComponent);
