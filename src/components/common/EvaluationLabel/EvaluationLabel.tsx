import React, { Component } from 'react';
import isNil from 'lodash/isNil';
import intl from 'react-intl-universal';

import './EvaluationLabel.scss';

interface Props {
  isPassed?: boolean | null;
  mark?: number | null;
  status?: boolean | null;
}

export class EvaluationLabel extends Component<Props> {

  public renderStatus = () => {
    const { isPassed } = this.props;

    if (isNil(isPassed)) {
      return intl.get('answers.Not evaluated');
    }
    if (isPassed) {
      return intl.get('answers.Passed');
    }
    return intl.get('answers.Not passed');
  }

  public renderSign = () => {
    const { status } = this.props;
    if (isNil(status)) {
      return;
    }
    if (status) {
      return '+';
    }
    return '-';
  }

  public render() {
    const { isPassed, mark } = this.props;
    const calcIsPassedStyle = isNil(isPassed) ? 'notEvaluated' : isPassed ? 'passed' : 'notPassed';

    return (
      <div className={`statusInfo status-${calcIsPassedStyle}`}>
        <div className={'statusLabel'}>{this.renderStatus()}</div>
        {isPassed && mark && <div className={`mark mark-${calcIsPassedStyle}`}>{mark} {this.renderSign()}</div>}
      </div>
    );
  }
}
