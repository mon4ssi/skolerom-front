import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import { toJS } from 'mobx';
import moment from 'moment';
import isNil from 'lodash/isNil';
import classNames from 'classnames';

import { Subject, Assignment } from 'assignment/Assignment';
import { deadlineDateFormat } from 'utils/constants';

import listPlaceholderImg from 'assets/images/list-placeholder.svg';
import clockImg from 'assets/images/rounded-clock.svg';
import clockGrayImg from 'assets/images/rounded-clock-gray.svg';
import notEvaluatedImg from 'assets/images/rounded-minus.svg';
import passedImage from 'assets/images/passed.svg';
import failedImage from 'assets/images/failed.svg';

import './StudentAssignmentsListItem.scss';

const maxNumberOfSubjects = 1;

interface StudentAssignmentsListItemProps {
  assignment: Assignment;
  onClickItem(e: SyntheticEvent): void;
}

export class StudentAssignmentsListItem extends Component<StudentAssignmentsListItemProps> {
  private renderSubject = (subject: Subject) => (
    <div className="StudentAssignmentsListItem__subject" key={subject.id}>
      {subject.title}
    </div>
  )

  private renderSubjects = () => {
    const { assignment } = this.props;
    const subjects = assignment.subjects.length <= maxNumberOfSubjects ?
      toJS(assignment.subjects) :
      [...toJS(assignment.subjects).splice(0, maxNumberOfSubjects), { id: 0, title: intl.get('assignment list.Others') }];
    return <div className="StudentAssignmentsListItem__subjects">{subjects.map(this.renderSubject)}</div>;
  }

  private renderQuestions = (isMobile: boolean = false) => {
    const { assignment } = this.props;
    const classes = classNames('StudentAssignmentsListItem__questions', {
      StudentAssignmentsListItem__questions_mobile: isMobile,
    });

    return (
      <div className={classes}>
        {assignment.numberOfQuestions}{' '}
        {assignment.numberOfQuestions === 1 ? intl.get('assignment list.question') : intl.get('assignment list.questions')}
      </div>
    );
  }

  private renderDeadline = () => {
    const { assignment } = this.props;
    const isPassedDeadline = moment(assignment.deadline).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD');
    const deadlineClasses = classNames('StudentAssignmentsListItem__deadlineText', {
      StudentAssignmentsListItem__deadlineText_passed: isPassedDeadline,
    });

    return (
      <div className="StudentAssignmentsListItem__deadline">
        <div className={deadlineClasses}>
          {isPassedDeadline ? intl.get('answers.past') : `${intl.get('answers.Due')} ${moment(assignment.deadline).format(deadlineDateFormat)}`}
        </div>
        <img className="StudentAssignmentsListItem__deadlineImage" src={isPassedDeadline ? clockGrayImg : clockImg} alt="Clock"/>
      </div>
    );
  }

  private renderEvaluationStatus = () => {
    const { assignment } = this.props;

    const text = isNil(assignment.isPassed)
      ? intl.get('assignments search.Not evaluated')
      : assignment.isPassed
        ? intl.get('assignments search.Evaluated')
        : intl.get('assignments search.Evaluated');

    const image = isNil(assignment.isPassed)
      ? notEvaluatedImg
      : assignment.isPassed
        ? passedImage
        : failedImage;

    const classes = classNames('StudentAssignmentsListItem__evaluationStatusText', {
      StudentAssignmentsListItem__evaluationStatusText_evaluated: !isNil(assignment.isPassed) && assignment.isPassed,
      StudentAssignmentsListItem__evaluationStatusText_failed: !isNil(assignment.isPassed) && !assignment.isPassed,
    });

    return (
      <div className="StudentAssignmentsListItem__evaluationStatus">
        <div className={classes}>
          {text}
        </div>
        <img className="StudentAssignmentsListItem__evaluationStatusImage" src={image} alt={intl.get('assignments search.Not evaluated')}/>
      </div>
    );
  }

  private renderAnswerStatus = (isTablet: boolean = false) => {
    const { assignment } = this.props;
    const assignmentClasses = classNames('StudentAssignmentsListItem__answerStatus', {
      StudentAssignmentsListItem__answerStatus_answered: assignment.isAnswered,
      StudentAssignmentsListItem__answerStatus_tablet: isTablet
    });

    return (
      <div className={assignmentClasses}>
        {assignment.isAnswered ? intl.get('assignments search.Answered') : intl.get('assignments search.Not answered')}
      </div>
    );
  }

  public render() {
    const { onClickItem, assignment } = this.props;

    return (
      <a className="StudentAssignmentsListItem" href="#" onClick={onClickItem}>
        <div className="StudentAssignmentsListItem__block StudentAssignmentsListItem__blockMain">
          <div className="StudentAssignmentsListItem__imageWrapper">
            <img
              className="StudentAssignmentsListItem__image"
              src={assignment.featuredImage ? assignment.featuredImage : listPlaceholderImg}
              alt={assignment.title}
            />
          </div>
          <div className="StudentAssignmentsListItem__title">
            {assignment.title}
          </div>
          {this.renderSubjects()}
          {this.renderQuestions(true)}
          {this.renderAnswerStatus(true)}
        </div>
        <div className="StudentAssignmentsListItem__block StudentAssignmentsListItem__blockSecondary">
          {this.renderQuestions()}
          {this.renderDeadline()}
          {this.renderEvaluationStatus()}
          {this.renderAnswerStatus()}
        </div>
      </a>
    );
  }
}
