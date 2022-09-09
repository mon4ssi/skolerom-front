import React, { Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { TypedQuestion } from 'assignment/Assignment';
import TextAreaAutosize from 'react-textarea-autosize';
import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { Answer, RedirectData } from 'assignment/questionary/Questionary';
import { LocationState } from 'assignment/view/CurrentAssignmentPage/CurrentAssignmentPage';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_DESCRIPTION_LENGTH_MAX } from 'utils/constants';

import './TextQuestionPreview.scss';
const ENTER_SINGLE_QUOTE_CODE = 219;
const ENTER_DOUBLE_QUOTE_CODE = 50;
const DELAY = 800;
interface Props {
  question: TypedQuestion | EditableQuestion;
  answer?: Answer;
  readOnly?: boolean;
  redirectData?: RedirectData;
  isEvaluationStyle?: boolean;
  handleShowArrowsTooltip?(status: boolean): void;
}

@observer
class TextQuestionPreviewComponent extends Component<Props & RouteComponentProps<{}, {}, LocationState>> {
  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  public componentDidUpdate() {
    if (this.titleRef.current) {
      this.titleRef.current!.focus();
    }
  }
  public handleChangeAnswer = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { redirectData, answer, handleShowArrowsTooltip, question } = this.props;
    event.preventDefault();
    const value = this.useValuedQuotes(event.currentTarget.value);
    answer!.setValue(value, redirectData);
    if (handleShowArrowsTooltip) {
      handleShowArrowsTooltip(true);
    }
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

  public renderContent = () => {
    const { readOnly, answer, isEvaluationStyle, question, redirectData } = this.props;
    const isHideValue = (question.hide_answer) ? intl.get('new assignment.Write your answer here') : answer && answer!.value;
    if (isEvaluationStyle) {
      const answerSplit = String(answer && answer.value).replace(/\n/g, '<br />');
      return <span className={'evaluationAnswer'} dangerouslySetInnerHTML={{ __html: answerSplit }} />;
    }
    if (question.hide_answer) {
      answer!.setValue(intl.get('new assignment.hidden_anwser'), redirectData);
    }
    if (readOnly) {
      return (
        <div className="InputSy">
          <label id="titleTextAnswser" className="hidden">{intl.get('new assignment.Write your answer here')}</label>
          <textarea
            autoFocus={!readOnly}
            value={isHideValue}
            className="studentsAnswer"
            placeholder={intl.get('new assignment.Write your answer here')}
            readOnly={readOnly}
            onChange={this.handleChangeAnswer}
            onKeyUp={this.focusTextField}
            aria-labelledby="titleTextAnswser"
            aria-required="true"
            aria-invalid="false"
            ref={this.titleRef}
          />
        </div>
      );
    }
    return (
      <div className="InputSy">
        <label id="titleTextAnswser" className="hidden">{intl.get('new assignment.Write your answer here')}</label>
        <TextAreaAutosize
          autoFocus={!readOnly}
          value={String(answer!.value)}
          className="studentsAnswer"
          placeholder={intl.get('new assignment.Write your answer here')}
          readOnly={readOnly}
          onChange={this.handleChangeAnswer}
          onKeyUp={this.focusTextField}
          aria-labelledby="titleTextAnswser"
          aria-required="true"
          aria-invalid="false"
          inputRef={this.titleRef}
        />
      </div>
    );
  }

  public render() {
    return (
      <div className="flexBox w100 dirColumn">
        {this.renderContent()}
      </div>
    );
  }
}

export const TextQuestionPreview = withRouter(TextQuestionPreviewComponent);
