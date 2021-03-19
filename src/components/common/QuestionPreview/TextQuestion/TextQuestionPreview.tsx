import React, { Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { TypedQuestion } from 'assignment/Assignment';
import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { Answer, RedirectData } from 'assignment/questionary/Questionary';
import { LocationState } from 'assignment/view/CurrentAssignmentPage/CurrentAssignmentPage';
import { lettersNoEn } from 'utils/lettersNoEn';

import './TextQuestionPreview.scss';

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
  public handleChangeAnswer = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { redirectData, answer, handleShowArrowsTooltip } = this.props;

    if (lettersNoEn(event.target.value)) {
      answer!.setValue(event.target.value, redirectData);
      if (handleShowArrowsTooltip) {
        handleShowArrowsTooltip(true);
      }
    }
  }

  public renderContent = () => {
    const { readOnly, answer, isEvaluationStyle } = this.props;

    if (isEvaluationStyle) {
      return <span className={'evaluationAnswer'}>{answer && answer.value}</span>;
    }
    return (
      <input
        autoFocus={!readOnly}
        value={answer && answer.value}
        className="studentsAnswer"
        placeholder={intl.get('new assignment.Write your answer here')}
        readOnly={readOnly}
        onChange={this.handleChangeAnswer}
      />
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
