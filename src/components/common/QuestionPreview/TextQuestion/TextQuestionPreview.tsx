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
import { replaceQuotes } from 'utils/replaceQuotes';
interface Props {
  question: TypedQuestion | EditableQuestion;
  answer?: Answer;
  readOnly?: boolean;
  redirectData?: RedirectData;
  isEvaluationStyle?: boolean;
  isPreview?: boolean;
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

    replaceQuotes(event.currentTarget);
    const value = event.currentTarget.value;

    answer!.setValue(value, redirectData);
    if (handleShowArrowsTooltip) {
      handleShowArrowsTooltip(true);
    }
  }
  public handleChangeAnswerFalse = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { redirectData, answer, handleShowArrowsTooltip, question } = this.props;
    event.preventDefault();

    replaceQuotes(event.currentTarget);
    const value = event.currentTarget.value;

    answer!.setValueFalse(value, redirectData);
    if (handleShowArrowsTooltip) {
      handleShowArrowsTooltip(true);
    }
  }

  public renderContent = () => {
    const { readOnly, answer, isEvaluationStyle, question, redirectData, isPreview } = this.props;
    const isHideValue = (question.hide_answer) ? '' : answer && answer!.value;
    const placeholder = (question.hide_answer) ? '' : intl.get('new assignment.Write your answer here');
    const studentsAnswer = (question.hide_answer) ? 'studentsAnswer notline' : 'studentsAnswer';
    if (isEvaluationStyle) {
      const answerSplit = String(answer && answer.value).replace(/\n/g, '<br />');
      return <span className={'evaluationAnswer'} dangerouslySetInnerHTML={{ __html: answerSplit }} />;
    }
    if (question.hide_answer) {
      if (answer) {
        answer!.setValue(intl.get('new assignment.hidden_anwser'), redirectData);
      }
    }
    if (readOnly) {
      return (
        <div className="InputSy">
          <label id="titleTextAnswser" className="hidden">{intl.get('new assignment.Write your answer here')}</label>
          <textarea
            autoFocus={!readOnly}
            value={isHideValue}
            className={studentsAnswer}
            placeholder={placeholder}
            readOnly={readOnly}
            onChange={this.handleChangeAnswerFalse}
            aria-labelledby="titleTextAnswser"
            aria-required="true"
            aria-invalid="false"
            ref={this.titleRef}
          />
        </div>
      );
    }
    /* if (isPreview) {
      return (
        <div className="InputSy testest">
          <label id="titleTextAnswser" className="hidden">{intl.get('new assignment.Write your answer here')}</label>
          <TextAreaAutosize
            autoFocus={!readOnly}
            value={String(answer!.value)}
            className={studentsAnswer}
            placeholder={placeholder}
            readOnly={readOnly}
            onChange={this.handleChangeAnswerFalse}
            aria-labelledby="titleTextAnswser"
            aria-required="true"
            aria-invalid="false"
            ref={this.titleRef}
          />
        </div>
      );
    } */
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
