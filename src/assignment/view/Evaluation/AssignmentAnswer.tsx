import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import isNull from 'lodash/isNull';
import classNames from 'classnames';

import { EditableEvaluation, Evaluation } from '../../../evaluation/Evaluation';

import clock from 'assets/images/rounded-clock.svg';
import editIcon from 'assets/images/edit.svg';
import editLightIcon from 'assets/images/edit-tp.svg';

import './AssignmentAnswer.scss';

interface AssignmentAnswerProps {
  result: EditableEvaluation;
  onClick: () => Promise<void>;
  locale: string;
}

export class AssignmentAnswer extends Component<AssignmentAnswerProps> {

  public renderAnsweredStatus = (status: boolean) => {
    const classes = classNames('AssignmentAnswer__answeredStatus', {
      AssignmentAnswer__answeredStatus_answered: status
    });

    return (
      <div className={classes}>
        {intl.get(`assignments search.${status ? 'Answered' : 'Not answered'}`)}
      </div>
    );
  }

  public handleAnswerClick = (event: SyntheticEvent) => {
    event.preventDefault();
    this.props.onClick();
  }

  public renderDeadline = (result: Evaluation) => {
    const { locale } = this.props;

    const dueDate = moment(moment().subtract(1, 'd')).locale(locale).to(moment(result.endDate), true);
    const isPassed = moment(moment(result.endDate)).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD');

    const deadline = isPassed
      ? intl.get('answers.past')
      : `${intl.get('answers.Due in')} ${dueDate}`;
    const classes = classNames('AssignmentAnswer__deadlineText', {
      AssignmentAnswer__deadlineText_passed: isPassed,
    });

    return (
      <div className="AssignmentAnswer__deadline">
        <div className={classes}>{deadline}</div>
        <img className="AssignmentAnswer__deadlineImage" src={clock} alt="clock"/>
      </div>
    );
  }

  public calculateStatus = (result: Evaluation) => {
    const classes = classNames('AssignmentAnswer__evaluationStatusText', {
      AssignmentAnswer__evaluationStatusText_evaluate: !result.isAnswered && isNull(result.mark) && isNull(result.isPassed),
      AssignmentAnswer__evaluationStatusText_passed: !(isNull(result.mark) && isNull(result.isPassed)) && result.isPassed,
      AssignmentAnswer__evaluationStatusText_failed: !(isNull(result.mark) && isNull(result.isPassed)) && !result.isPassed
    });
    const sign = isNull(result.status) ? '' : result.status ? '+' : '-';
    const rate = !isNull(result.mark) ? `| ${result.mark}${sign}` : '';

    const content = (isNull(result.mark) && isNull(result.isPassed)) ?
      intl.get('answers.Evaluate') :
      result.isPassed ?
        `${intl.get('answers.Passed')} ${rate}` :
        `${intl.get('answers.Not passed')} ${rate}`;

    const image = result.isAnswered ? editIcon : editLightIcon;

    return (
      <div className="AssignmentAnswer__evaluationStatus">
        <span className={classes}>{content}</span>
        <img className="AssignmentAnswer__evaluationStatusImage" src={image} alt="Edit"/>
      </div>
    );
  }

  public render () {
    const { result } = this.props;

    return (
      <a className="AssignmentAnswer" href="#" onClick={this.handleAnswerClick}>
        <div className="AssignmentAnswer__student">{result.studentName}</div>
        <div className="AssignmentAnswer__statusBar">
          {this.renderAnsweredStatus(result.isAnswered)}
          {this.renderDeadline(result)}
          {this.calculateStatus(result)}
        </div>
      </a>
    );
  }
}
