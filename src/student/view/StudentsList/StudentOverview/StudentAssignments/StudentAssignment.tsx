import React from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import isNull from 'lodash/isNull';
import classNames from 'classnames';

import { Assignment } from 'assignment/Assignment';

import clockImg from 'assets/images/rounded-clock.svg';
import editImg from 'assets/images/edit.svg';

import './StudentAssignment.scss';

interface StudentAssignmentProps {
  assignment: Assignment;
  locale: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const StudentAssignment = (props: StudentAssignmentProps) => {
  const { locale, assignment, onClick } = props;

  const dueDate = moment(moment().subtract(1, 'd')).locale(locale).to(moment(assignment.deadline), true);
  const isPassedDeadline = moment(assignment.deadline).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD');

  const sign = isNull(assignment.status) ? '' : assignment.status ? '+' : '-';
  const rate = !isNull(assignment.mark) ? `| ${assignment.mark}${sign}` : '';

  const evaluationText = (isNull(assignment.mark) && isNull(assignment.isPassed))
    ? intl.get('answers.Evaluate')
    : assignment.isPassed
      ? `${intl.get('answers.Passed')} ${rate}`
      : intl.get('answers.Not passed');

  const deadlineText = isPassedDeadline ?
    intl.get('answers.past') :
    `${intl.get('answers.Due in')} ${dueDate}`;

  const deadlineClasses = classNames('StudentAssignment__deadline', {
    StudentAssignment__deadline_grey: assignment.isEvaluated,
    StudentAssignment__deadline_purple: !assignment.isEvaluated && isPassedDeadline,
  });
  const deadlineImageClasses = classNames('StudentAssignment__deadlineImage', {
    StudentAssignment__deadlineImage_grey: !assignment.isEvaluated
  });
  const evaluationStatusClasses = classNames('StudentAssignment__evaluationStatus', {
    StudentAssignment__evaluationStatus_evaluate: (isNull(assignment.mark) && isNull(assignment.isPassed)) && assignment.isAnswered,
    StudentAssignment__evaluationStatus_passed: !(isNull(assignment.mark) && isNull(assignment.isPassed)) && assignment.isPassed,
    StudentAssignment__evaluationStatus_failed: !(isNull(assignment.mark) && isNull(assignment.isPassed)) && !assignment.isPassed,
  });
  const evaluationStatusImageClasses = classNames('StudentAssignment__evaluationStatusImage', {
    StudentAssignment__evaluationStatusImage_evaluate: assignment.isAnswered
  });

  function renderAnswerStatus(isMobile: boolean = false) {
    const answerStatusClasses = classNames('StudentAssignment__answerStatus', {
      StudentAssignment__answerStatus_answered: assignment.isAnswered,
      StudentAssignment__answerStatus_mobile: isMobile,
    });

    return (
      <div className={answerStatusClasses}>
        {assignment.isAnswered ? intl.get('assignments search.Answered') : intl.get('assignments search.Not answered')}
      </div>
    );
  }

  return (
    <button
      className="StudentAssignment"
      onClick={onClick}
    >
      <div className="StudentAssignment__blockMain">
        <div className="StudentAssignment__title">
          {assignment.title}
        </div>
        {renderAnswerStatus(true)}
      </div>

      <div className="StudentAssignment__info">
        {renderAnswerStatus()}
        <div className={deadlineClasses}>
          {deadlineText}
          <img
            src={clockImg}
            alt="Clock"
            className={deadlineImageClasses}
          />
        </div>

        <div className={evaluationStatusClasses}>
          {evaluationText}
          <img
            src={editImg}
            alt={intl.get('assignments search.Not evaluated')}
            className={evaluationStatusImageClasses}
          />
        </div>
      </div>
    </button>
  );
};
